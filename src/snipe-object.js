export class SnipeObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const data = await request.json();
    
    // Store the exact request we will fire later
    await this.state.storage.put('config', {
      wardyatiEndpoint: data.wardyatiEndpoint,
      method: data.method,
      headers: data.headers,
      body: data.body
    });

    // Set the alarm for the exact millisecond
    await this.state.storage.setAlarm(new Date(data.targetTime).getTime());
    
    return new Response('Scheduled');
  }

  async alarm() {
    const config = await this.state.storage.get('config');
    
    console.log('🚀 FIRING SNIPE at', new Date());
    
    const response = await fetch(config.wardyatiEndpoint, {
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined
    });

    const result = await response.text();
    console.log('Wardayti response:', result);
    
    // Optional: you can notify your extension here later
  }
}
