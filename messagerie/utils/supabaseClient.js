// 1. Supabase configuration
// The publishable key is meant to be public; real protection comes from
// Row Level Security (RLS) policies configured in Supabase.
const SUPABASE_URL = "https://qgtpterfnrltrmsygbrh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_X8CN-z4V1TrT3eNmq_GrmQ_nNfDNrRU";

// 2. Create the Supabase client (`supabase` is the global from the CDN script,
// which must be loaded before this file)
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);


// 3. Connection test: tries to read one row from 'channels'
async function verifierConnexion() {
    try {
        const { error } = await _supabase.from("channels").select("id").limit(1);

        if (error) {
            console.log("Erreur de connexion :", error.message);
            return false;
        }

        console.log("Connexion reussie !");
        return true;

    } catch (err) {
        console.log("Erreur technique :", err);
        return false;
    }
}

// Run the check at startup
verifierConnexion();