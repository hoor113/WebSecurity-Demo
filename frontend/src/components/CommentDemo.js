import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/api/comment';

const CommentDemo = () => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');

  const fetchComments = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setComments(data.comments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) return;
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input })
    });
    setInput('');
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
      <h2>Comment Demo (XSS Vulnerable)</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Write your comment here..."
          style={{ width: '100%', height: 80, marginBottom: 12 }}
        />
        <br />
        <button type="submit" style={{ padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>
          Post Comment
        </button>
      </form>
      <h3>Comments</h3>
      <div>
        {comments.map((c, i) => (
          <div
            key={i}
            style={{ background: 'white', margin: '8px 0', padding: 10, borderRadius: 4 }}
            dangerouslySetInnerHTML={{ __html: c }} // LỖ HỔNG XSS
          />
        ))}
      </div>
    </div>
  );
};

export default CommentDemo; 