import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      child_id,
      child_name,
      age_group,
      emotional_state,
      theme,
      length = 'standard',
      notes
    } = body;

    if (!child_id || !child_name || !age_group || !emotional_state) {
      return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'supabase env vars missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // validate child exists
    const { data: child, error: childErr } = await supabase
      .from('family_members')
      .select('id')
      .eq('id', child_id)
      .single();
    if (childErr || !child) {
      return NextResponse.json({ error: 'child not found' }, { status: 400 });
    }

    const lengthWords: Record<string, number> = { short: 250, standard: 500, long: 800 };
    const wordCount = lengthWords[length] || lengthWords['standard'];

    const prompt = `Write a bedtime story for a ${age_group} child named ${child_name} who is feeling ${emotional_state}.
The story should be themed around ${theme || 'gentle imagination'} and include a soothing resolution.
Tone: gentle, imaginative, emotionally validating. End with a calming phrase.
Length: ${wordCount} words.
Notes: ${notes || 'none'}.
Return a JSON object with keys \"title\" and \"story\".`;

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY missing' }, { status: 500 });
    }

    const storyRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const storyJson = await storyRes.json();
    let title = 'Bedtime Story';
    let storyText = '';
    try {
      const parsed = JSON.parse(storyJson.choices?.[0]?.message?.content || '{}');
      title = parsed.title || title;
      storyText = parsed.story || storyText;
    } catch {
      storyText = storyJson.choices?.[0]?.message?.content || '';
    }

    if (!storyText) {
      return NextResponse.json({ error: 'failed to generate story' }, { status: 500 });
    }

    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: 'alloy',
        input: storyText,
        format: 'mp3'
      })
    });
    const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());

    const audioFile = `${randomUUID()}.mp3`;
    const { error: uploadErr } = await supabase.storage
      .from('story-audio')
      .upload(audioFile, audioBuffer, { contentType: 'audio/mpeg' });
    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('story-audio')
      .getPublicUrl(audioFile);
    const audioUrl = publicUrlData.publicUrl;

    const durationMap: Record<string, string> = {
      short: '3 minutes',
      standard: '5 minutes',
      long: '8 minutes'
    };
    const durationEstimate = durationMap[length] || durationMap['standard'];
    const tags = [emotional_state, age_group, theme, 'soothing'].filter(Boolean);

    const { data: insertData, error: insertErr } = await supabase
      .from('stories')
      .insert({
        child_id,
        title,
        text: storyText,
        age_group,
        emotional_state,
        theme,
        tags,
        duration_estimate: durationEstimate,
        audio_url: audioUrl
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      story_id: insertData.id,
      title,
      text: storyText,
      duration_estimate: durationEstimate,
      audio_url: audioUrl,
      tags
    });
  } catch (err) {
    console.error('[generate-story] error', err);
    const message = err instanceof Error ? err.message : 'Error';
    return new NextResponse(message, { status: 500 });
  }
}

