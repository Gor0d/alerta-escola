import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qzbykuloshtkdxrvivuo.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YnlrdWxvc2h0a2R4cnZpdnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTAwOTQsImV4cCI6MjA1ODkyNjA5NH0.F5kNlTsiMYDtq66tRJ2Y-0K0dSJ4bjtl4BBTNq9cIY4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY) 

export default supabase;
