// 1. Configuration Supabase
const SUPABASE_URL = "https://qgtpterfnrltrmsygbrh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_X8CN-z4V1TrT3eNmq_GrmQ_nNfDNrRU";

// 2. Connexion automatique à Supabase
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);


// 3. Test de co
async function verifierConnexion() {
    try {
        const { error } = await supabase.from("channels").select("id").limit(1);

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

// Lance le cheque de vérif
verifierConnexion();
