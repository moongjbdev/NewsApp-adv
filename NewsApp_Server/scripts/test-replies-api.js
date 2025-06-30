const axios = require('axios');

async function testRepliesAPI() {
  try {
    console.log('🧪 Testing replies API...\n');

    // Login as userB
    console.log('🔐 Logging in as userB...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser2@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ UserB logged in successfully');

    // Test getting replies for a specific comment
    const commentId = '68618a23fa69742470f2698a'; // Replace with actual comment ID
    console.log(`\n🌐 Testing GET /api/comments/${commentId}/replies`);
    
    const repliesResponse = await axios.get(`http://localhost:5000/api/comments/${commentId}/replies`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const replies = repliesResponse.data.replies;
    console.log('📥 Replies from API:', replies.length);
    replies.forEach((reply, index) => {
      console.log(`  ${index + 1}. ID: ${reply._id}`);
      console.log(`     Content: ${reply.content}`);
      console.log(`     Created: ${reply.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRepliesAPI(); 