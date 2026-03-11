export interface BrandEvent {
  step: string;
  message: string;
  brand_id?: string;
  progress?: number;
  data?: any;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "");

export async function* createBrandStream(url: string, brandName: string): AsyncGenerator<BrandEvent, void, unknown> {
  const payload = { 
    website_url: url,
    name: brandName || "My Brand" // Fallback name since it's a required field on the backend
  };

  const res = await fetch(`${API_BASE_URL}/brands`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create brand: ${res.statusText}`);
  }

  if (!res.body) {
    throw new Error("ReadableStream not supported in this browser.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

    for (const line of lines) {
      if (line.trim() === "") continue;
      
      // Attempt to parse line as JSON if the server doesn't strictly use standard "data: {...}" SSE prefixes
      let jsonString = line;
      if (line.startsWith("data:")) {
        jsonString = line.slice(5).trim();
      }

      try {
        if (jsonString) {
           const event: BrandEvent = JSON.parse(jsonString);
           yield event;
        }
      } catch (e) {
        // Ignore lines that aren't valid JSON (like raw "data:" ping strings)
      }
    }
  }
}
