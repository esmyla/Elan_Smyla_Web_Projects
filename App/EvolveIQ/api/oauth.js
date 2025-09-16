// api/oauth.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${req.headers.origin}/` // where to send user after login
        },
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ url: data.url });
}
