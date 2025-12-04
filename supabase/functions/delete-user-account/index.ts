import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Lógica CORS para permitir chamadas do seu app
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    // Cria um cliente Admin do Supabase usando a chave de serviço
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extrai o ID do usuário a partir do token de autenticação da chamada
    const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.get("Authorization")!.replace("Bearer ", ""));

    if (!user) throw new Error("Usuário não encontrado.");

    // Deleta o usuário do sistema de autenticação
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Conta excluída com sucesso." }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 400,
    });
  }
});
