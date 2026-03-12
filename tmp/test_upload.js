
async function testUpload() {
    const API_URL = 'http://localhost:4000/api';
    const formData = new FormData();
    const blob = new Blob(['fake image data'], { type: 'image/png' });
    formData.append('file', blob, 'test.png');

    try {
        console.log('Testing upload to:', `${API_URL}/uploads`);
        const res = await fetch(`${API_URL}/uploads`, {
            method: 'POST',
            body: formData,
            // Authenticate if needed (e.g., using a demo token if backend allows it)
        });
        console.log('Response Status:', res.status);
        const data = await res.json().catch(() => ({}));
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Upload failed:', err.message);
    }
}

testUpload();
