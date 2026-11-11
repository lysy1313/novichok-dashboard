import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
  }

  // 1. Получаем всех сотрудников с telegram_id
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, telegram_id');

  // 2. Получаем сегодняшние чекины
  const { data: checks } = await supabase
    .from('pulse_checks')
    .select('employee_id');

  const checkedEmpIds = new Set((checks || []).map(c => c.employee_id));

  // 3. Фильтруем тех, кто не прошёл опрос и имеет telegram_id
  const targetEmployees = (employees || []).filter(
    e => !checkedEmpIds.has(e.id) && e.telegram_id
  );

  let sentCount = 0;
  for (const emp of targetEmployees) {
    const text = `🔔 **Напоминание от наставника!**\n\nПривет, ${emp.full_name}!\nСмена подходит к концу. Пожалуйста, удели 15 секунд и отметь, как прошёл твой день 👇`;
    const keyboard = {
      inline_keyboard: [
        [{ text: '📊 Пройти пульс дня', callback_data: 'q_lunch' }]
      ]
    };

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: emp.telegram_id,
          text,
          parse_mode: 'Markdown',
          reply_markup: keyboard
        })
      });
      if (res.ok) sentCount++;
    } catch (err) {
      console.error(`Ошибка отправки сотруднику ${emp.id}:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    sentCount,
    totalUnchecked: (employees || []).filter(e => !checkedEmpIds.has(e.id)).length
  });
}
