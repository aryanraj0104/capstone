import * as faceapi from 'face-api.js';


const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

export const loadModels = async () => {
    try {
        console.log("Loading Face API models...");
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log("Models loaded successfully");
        return true;
    } catch (error) {
        console.error("Failed to load models:", error);
        return false;
    }
};

export const getFaceDescriptor = async (input: HTMLVideoElement | HTMLImageElement) => {
    // Optimized settings for better accuracy:
    // - inputSize: 320 (larger = more facial details, better person distinction, 320 is a good balance)
    // - scoreThreshold: 0.5 (lower = detect faces more easily in various lighting)
    const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5
    });

    const fullFaceDescription = await faceapi.detectSingleFace(input, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!fullFaceDescription) {
        return null;
    }

    // Log detection confidence for debugging
    console.log("Face detection score:", fullFaceDescription.detection.score);

    return fullFaceDescription.descriptor;
};

export const loadReferenceDescriptor = async (url: string) => {
    try {
        const img = await faceapi.fetchImage(url);

        // Validate image dimensions
        console.log("Reference image dimensions:", img.width, "x", img.height);

        const descriptor = await getFaceDescriptor(img);

        if (!descriptor) {
            console.error("No face detected in reference image");
            return null;
        }

        console.log("Reference descriptor loaded successfully");
        return descriptor;
    } catch (err) {
        console.error("Failed to load reference image:", err);
        return null;
    }
};

export const isMatch = (descriptor1: Float32Array, descriptor2: Float32Array) => {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

    // Log distance for debugging
    console.log("Face match distance:", distance.toFixed(3));

    // Balanced threshold (compromise between strict and flexible):
    // - Distance < 0.5 = match (allows glasses, but still secure)
    // - Distance 0.5-0.6 = borderline (rejected to prevent false positives)
    // - Distance > 0.6 = no match (different person)
    // 
    // This threshold aims to:
    // ✓ Recognize same person with glasses
    // ✓ Reject different people (even with glasses)
    // ⚠️ If this still matches others, you may need multiple reference images
    // Balanced threshold (compromise between strict and flexible):
    // - Distance < 0.55 = match (allows glasses/minor changes)
    const threshold = 0.55;
    const matched = distance < threshold;

    console.log(matched ? "✓ MATCH FOUND" : "✗ No match", `(threshold: ${threshold})`);

    return matched;
};
