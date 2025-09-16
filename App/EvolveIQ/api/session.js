import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
    if (req.method === "GET") {
        const { data } = await supabase.auth.getSession();
        return res.status(200).json(data);
    }
    res.status(405).json({ error: "Method not allowed" });
}
