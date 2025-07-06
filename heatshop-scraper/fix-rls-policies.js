/**
 * Fix RLS Policies for Supabase GraphQL
 * 
 * This script provides the correct SQL commands to fix the RLS policies
 * for the product_images table based on our debugging results.
 */

console.log('🔧 RLS Policy Fix for Supabase GraphQL\n');

console.log('The debug script revealed that both service role and anonymous keys are failing.');
console.log('This means the RLS policy expressions need to be corrected.\n');

console.log('📋 Execute these SQL commands in your Supabase SQL Editor:\n');

console.log('-- Step 1: Drop existing policies to start fresh');
console.log('DROP POLICY IF EXISTS "Public read access" ON public.product_images;');
console.log('DROP POLICY IF EXISTS "Service role full access" ON public.product_images;\n');

console.log('-- Step 2: Create the correct read policy');
console.log('CREATE POLICY "Public read access"');
console.log('ON public.product_images');
console.log('FOR SELECT');
console.log('TO public');
console.log('USING (true);\n');

console.log('-- Step 3: Create the correct write policy for service role');
console.log('CREATE POLICY "Service role full access"');
console.log('ON public.product_images');
console.log('FOR ALL');
console.log('TO service_role');
console.log('USING (true);');
console.log('-- Note: service_role bypasses RLS by default, but this ensures explicit permission\n');

console.log('-- Step 4: Create a policy for authenticated users (optional but recommended)');
console.log('CREATE POLICY "Authenticated users can insert"');
console.log('ON public.product_images');
console.log('FOR INSERT');
console.log('TO authenticated');
console.log('WITH CHECK (true);\n');

console.log('-- Step 5: Create a policy for anonymous users (if needed)');
console.log('CREATE POLICY "Anonymous users can insert"');
console.log('ON public.product_images');
console.log('FOR INSERT');
console.log('TO anon');
console.log('WITH CHECK (true);\n');

console.log('-- Step 6: Verify RLS is enabled');
console.log('SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = \'product_images\';\n');

console.log('-- Step 7: List all policies to verify');
console.log('SELECT policyname, roles, cmd, qual, with_check');
console.log('FROM pg_policies');
console.log('WHERE tablename = \'product_images\';\n');

console.log('🚨 ALTERNATIVE APPROACH: If the above doesn\'t work, try disabling RLS entirely for testing:');
console.log('-- WARNING: This removes security - only use for development/testing');
console.log('ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;\n');

console.log('📚 Key Points:');
console.log('1. The TO clause specifies which role the policy applies to');
console.log('2. service_role should bypass RLS automatically, but explicit policies help');
console.log('3. USING clause controls SELECT operations');
console.log('4. WITH CHECK clause controls INSERT/UPDATE operations');
console.log('5. anon role is for unauthenticated requests');
console.log('6. authenticated role is for logged-in users');

console.log('\n🔄 After executing these commands, run the test again:');
console.log('node debug-rls.js');

module.exports = {
  fixPolicies: () => {
    console.log('Please execute the SQL commands shown above in your Supabase dashboard.');
  }
};
