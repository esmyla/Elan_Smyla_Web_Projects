import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { email, password, fullName } = req.body;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: fullName } },
        });

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
    }
    res.status(405).json({ error: "Method not allowed" });
}
