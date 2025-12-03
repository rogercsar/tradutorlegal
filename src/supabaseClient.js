import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'SUA_URL_DO_SUPABASE' // Pegue no dashboard do Supabase
const supabaseKey = 'SUA_CHAVE_ANON_KEY' // Pegue no dashboard do Supabase

export const supabase = createClient(supabaseUrl, supabaseKey)