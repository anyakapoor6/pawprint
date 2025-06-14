// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'


serve(async (req: Request) => {

  const { expoToken, title, body, data } = await req.json()


  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoToken,
      title,
      body,
      data,
    }),
  })

  const result = await response.json()

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
})
