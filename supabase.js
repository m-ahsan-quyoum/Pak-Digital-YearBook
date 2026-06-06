import { createClient } from '@supabase/supabase-js'

// 📌 YAHAN APNI VALUES DAALEIN (Supabase Dashboard se copy karein)
const supabaseUrl = 'https://vjhlmxqwdriyrofzibsb.supabase.co'
const supabaseAnonKey = 'sb_publishable_jhxtz2jEeYK2mzWQd_tgdw_4ToyApFg'

// 👇 Connection create karna
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
