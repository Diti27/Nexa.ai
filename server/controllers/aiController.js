import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import{v2 as cloudinary} from"cloudinary";
import fs from'fs'
import { PDFParse } from 'pdf-parse'
import { removeBackground } from "@imgly/background-removal-node";
// GoogleGenAI import removed - using Pollinations AI instead

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// geminiImageClient removed - Pollinations AI uses direct HTTP requests


export const generateArticle = async (req,res)=>{
    try {
        const{userId}= await req.auth();
        const{prompt,length}=req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message:"Limit reached. Upgrade to continue"})
        }

     const response = await AI.chat.completions.create({
    model: "gemini-3.5-flash",
    messages: [
        {
            role: "user",
            content: `${prompt}

Write approximately ${length} words.
Stay close to the requested word count.
Use a clear title, introduction, headings, and conclusion.`,
        },
    ],
    temperature: 0.7,
});

    const content = response.choices[0].message.content
    await sql `INSERT INTO creations (user_id, prompt, content,type)
    VALUES(${userId},${prompt},${content},'article')`;

    if(plan!=='premium'){
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                free_usage: free_usage + 1
            }
        })
    }

    res.json({success:true,content})

     } catch (error) {
        console.log(error.message)
        res.json({success: false,message:error.message})

    }
}

export const generateBlogTitle = async (req,res)=>{
    try {
        const{userId}= req.auth();
        const{prompt}=req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message:"Limit reached. Upgrade to continue"})
        }

        const response = await AI.chat.completions.create({
    model: "gemini-3.6-flash",
    messages: [
        {
            role: "user",
            content: prompt + "\n\nProvide a numbered list of 5-8 complete, creative, and catchy blog title suggestions. Make sure to write all titles in full.",
        },
    ],
    temperature: 0.8,
    max_tokens: 500,
});

    const content = response.choices[0].message.content

    // Debug logging
    console.log("=== BLOG TITLE GENERATION ===")
    console.log("Prompt:", prompt)
    console.log("Response finish_reason:", response.choices[0].finish_reason)
    console.log("Content length:", content.length)
    console.log("Content:", content)
    console.log("Full response:", JSON.stringify(response, null, 2))
    console.log("============================")

    await sql `INSERT INTO creations (user_id, prompt, content,type)
    VALUES(${userId},${prompt},${content},'blog-title')`;

    if(plan!=='premium'){
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                free_usage: free_usage + 1
            }
        })
    }

    res.json({success:true,content})

     } catch (error) {
        console.log("=== ERROR ===")
        console.log(error.message)
        console.log(error)
        console.log("=============")
        res.json({success: false,message:error.message})

    }
}

export const generateImage = async (req,res)=>{
    try {
        const{userId}= await req.auth();
        const{prompt,publish}=req.body;
        const plan = req.plan;

        if(plan !== 'premium' ){
            return res.json({success: false, message:"This feature is only available for premium subscriptions"})
        }

        const seed = Math.floor(Math.random() * 10000000);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=turbo&nologo=true&seed=${seed}`;

        const headers = {};
        if (process.env.POLLINATIONS_API_KEY) {
            headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
        }

        const imageResponse = await axios.get(pollinationsUrl, {
            headers,
            responseType: 'arraybuffer',
            timeout: 30000
        });

        if (imageResponse.status !== 200 || !imageResponse.data || imageResponse.data.length === 0) {
            throw new Error("Failed to generate image from provider");
        }

        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
        const base64Image = `data:${mimeType};base64,${Buffer.from(imageResponse.data).toString('base64')}`;

        let contentUrl = pollinationsUrl;

        // Upload to Cloudinary if available; fallback gracefully to provider image URL
        try {
            const uploadResult = await cloudinary.uploader.upload(base64Image, { resource_type: 'image' });
            if (uploadResult?.secure_url) {
                contentUrl = uploadResult.secure_url;
            }
        } catch (cldError) {
            console.log("Cloudinary upload failed, using direct image URL:", cldError.message);
        }

        await sql `INSERT INTO creations (user_id, prompt, content,type,publish)
        VALUES(${userId},${prompt},${contentUrl},'image',${publish ?? false})`;

        res.json({success:true,content:contentUrl})

     } catch (error) {
        console.log("Image generation error:", error.message);
        const userMessage = error.response?.data?.message || error.message || "Failed to generate image";
        res.json({success: false, message: userMessage});
    }
}



export const removeImageBackground = async (req,res)=>{
    const image = req.file;
    try {
        const { userId } = await req.auth();
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
        }

        if (!image) {
            return res.json({ success: false, message: "No image file provided" });
        }

        // Read file into buffer and wrap in typed Blob to avoid Windows path URL scheme error ('Unsupported protocol: c:')
        const imageBuffer = fs.readFileSync(image.path);
        const imageBlob = new Blob([imageBuffer], { type: image.mimetype || 'image/png' });
        const blob = await removeBackground(imageBlob);
        const arrayBuffer = await blob.arrayBuffer();
        const base64Image = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

        // Standard Cloudinary upload without paid add-on transformations
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            resource_type: 'image'
        });
        const secure_url = uploadResult.secure_url;

        await sql `INSERT INTO creations (user_id, prompt, content,type)
        VALUES(${userId},'Remove background from image',${secure_url},'image')`;

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log("Remove background error:", error.message);
        res.json({ success: false, message: error.message });
    } finally {
        if (image?.path && fs.existsSync(image.path)) {
            try {
                fs.unlinkSync(image.path);
            } catch (cleanupErr) {
                console.log("Failed to clean up temp file:", cleanupErr.message);
            }
        }
    }
}


export const removeImageObject = async (req,res)=>{
    try {
        const{userId}= req.auth();
        const{object}= req.body;
        const image=req.file;
        const plan = req.plan;


        if(plan !== 'premium' ){
            return res.json({success: false, message:"This feature is only available for premium subscriptions"})
        }


        const{public_id}= await cloudinary.uploader.upload(image.path)

         const imageUrl =cloudinary.url(public_id,{
            transformation:[{effect:`gen_remove:${object}`}],
            resource_type:'image'
        })

    await sql `INSERT INTO creations (user_id, prompt, content,type)
    VALUES(${userId},${`Removed ${object}from image`},${imageUrl},'image')`;

    res.json({success:true,content:imageUrl})

     } catch (error) {
        console.log(error.message)
        res.json({success: false,message:error.message})

    }
}


export const resumeReview = async (req,res)=>{
    const resume = req.file;
    try {
        const { userId } = await req.auth();
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
        }

        if (!resume) {
            return res.json({ success: false, message: "No resume file provided" });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size(5MB)." });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        await parser.destroy();

        const prompt = `You are an expert career consultant and technical resume reviewer. Conduct a thorough, highly detailed, and constructive review of the resume provided below.

Strict Guidelines:
- Ground your analysis strictly in the provided resume text. Do NOT fabricate or assume any experience, skills, metrics, or achievements absent from the resume.
- Cite specific roles, projects, bullet points, or technologies from the resume as concrete evidence for your feedback.
- Format your response clearly in Markdown with distinct headings, bullet points, and practical explanations.

Structure your review with the following sections:

### 1. Overall Assessment
Provide a comprehensive evaluation of the resume's clarity, professional tone, formatting, and overall impact for the candidate's target field.

### 2. Key Strengths
Highlight 3-5 specific strengths, quoting or referencing concrete examples from their listed experience, education, or accomplishments.

### 3. Critical Weaknesses & Areas for Improvement
Detail specific shortcomings (e.g., lack of quantifiable impact/metrics, passive language, vague responsibilities, formatting inconsistencies), citing exact examples from the text.

### 4. Technical Skills & Keyword Optimization
Assess the candidate's skill section and relevance for ATS screening. Identify valuable, role-relevant industry keywords, tools, or frameworks that are currently missing or underemphasized.

### 5. Concrete Project & Experience Rewrites
Select 2-3 existing bullet points or project descriptions from the resume and provide specific, high-impact rewrite suggestions using the Action Verb + Context + Measurable Result framework without inventing false facts.

### 6. Actionable Recommendations
Give a prioritized, practical checklist of immediate edits to elevate the resume's competitive edge.

Resume Content:
${pdfData.text}`;

        const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash"];
        let content = null;
        let lastError = null;

        for (const model of modelsToTry) {
            let retries = 0;
            const maxRetries = 1;

            while (retries <= maxRetries) {
                try {
                    const response = await AI.chat.completions.create({
                        model,
                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 2500,
                    });

                    content = response.choices[0]?.message?.content;
                    if (content) {
                        break;
                    }
                    throw new Error("Received empty response from AI model");
                } catch (err) {
                    lastError = err;
                    const is503 = err.status === 503 || (err.message && err.message.includes("503"));
                    if (is503 && retries < maxRetries) {
                        retries++;
                        console.log(`Gemini 503 on ${model}. Quick retry in 1000ms (attempt ${retries}/${maxRetries})...`);
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    } else {
                        break;
                    }
                }
            }

            if (content) {
                break;
            }
        }

        if (!content) {
            const is503 = lastError?.status === 503 || (lastError?.message && lastError?.message.includes("503"));
            const userMessage = is503
                ? "The AI review service is temporarily overloaded. Please try again in a few moments."
                : (lastError?.message || "Failed to review resume");
            return res.json({ success: false, message: userMessage });
        }

        await sql `INSERT INTO creations (user_id, prompt, content,type)
        VALUES(${userId},'Review the uploaded resume',${content},'resume-review')`;

        res.json({ success: true, content });

    } catch (error) {
        console.log("Resume review error:", error.message);
        const is503 = error.status === 503 || (error.message && error.message.includes("503"));
        const message = is503
            ? "The AI review service is temporarily overloaded. Please try again in a few moments."
            : error.message;
        res.json({ success: false, message });
    } finally {
        if (resume?.path && fs.existsSync(resume.path)) {
            try {
                fs.unlinkSync(resume.path);
            } catch (cleanupErr) {
                console.log("Failed to clean up resume file:", cleanupErr.message);
            }
        }
    }
}
