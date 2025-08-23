export function track(event: string, properties?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.log("track", event, properties);
  }
}
