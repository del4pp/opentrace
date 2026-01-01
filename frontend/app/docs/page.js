export default function DocsPage() {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Documentation</h1>

            <section style={{ marginBottom: '4rem' }}>
                <h2>Quick Install</h2>
                <p>Teleboard is designed to be deployed in seconds using Docker.</p>
                <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid #333' }}>
                    <code>git clone https://github.com/del4pp/teleboard.git<br />cd teleboard<br />docker-compose up -d</code>
                </div>
            </section>

            <section style={{ marginBottom: '4rem' }}>
                <h2>Tracking API</h2>
                <p>To track events from your bot, simply make a GET request to your Teleboard instance.</p>

                <div style={{ marginTop: '2rem' }}>
                    <h3>1. Subscription Tracking</h3>
                    <p>Call this when a user starts your bot.</p>
                    <pre style={{ background: '#111', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
                        GET /event/subscribe?bot_id=MY_BOT&user_id=12345
                    </pre>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>2. Custom Event</h3>
                    <p>Track button clicks or any custom user action.</p>
                    <pre style={{ background: '#111', padding: '1rem', borderRadius: '8px' }}>
                        GET /event/btn_click?bot_id=MY_BOT&user_id=12345&payload=main_menu
                    </pre>
                </div>
            </section>

            <section>
                <h2>Self-Hosting on VPS</h2>
                <p>1. Install Docker and Docker Compose on your VPS.<br />
                    2. Point your domain (e.g. analytics.mysite.com) to the VPS IP.<br />
                    3. Run the setup commands above.<br />
                    4. Teleboard includes built-in SEO and mobile responsiveness.</p>
            </section>
        </div>
    );
}
