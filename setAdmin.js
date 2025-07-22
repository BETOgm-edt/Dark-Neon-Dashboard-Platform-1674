import supabase from './src/lib/supabase.js';

async function setAdmin(email) {
  const { data, error } = await supabase
    .from('users_dashboard_7h9f3k')
    .update({ is_admin: true })
    .eq('email', email);
  if (error) {
    console.error('Erro ao definir admin:', error.message);
  } else {
    console.log('Admin atualizado:', data);
  }
}

(async () => {
  await setAdmin('betovtdesign@gmail.com');
})();
 //