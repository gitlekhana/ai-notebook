export default async function handler(req, res) {
  const { notes } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "user", content: `Summarize these notes:\n${notes}` }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      summary: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
}