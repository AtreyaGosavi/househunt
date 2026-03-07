import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box, Typography, TextField, IconButton, Avatar,
  CircularProgress, Paper, Divider, Stack, InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { AuthContext } from '../context/AuthContext';

/**
 * ChatBox – lightweight in-page chat between tenant and owner.
 * NOTE: This is a UI component wired to a simple localStorage-based
 * message store (mock). Replace the persistence layer with a real
 * WebSocket / API when the backend chat service is ready.
 *
 * Props:
 *  ownerName   {string}
 *  ownerId     {string}
 *  propertyId  {string}
 */
const ChatBox = ({ ownerName, ownerId, propertyId }) => {
  const { user } = useContext(AuthContext);
  const storageKey = `hh_chat_${propertyId}_${user?._id || 'guest'}`;
  const bottomRef = useRef(null);

  const loadMessages = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  };

  const [messages, setMessages] = useState(loadMessages);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);

    const newMsg = {
      id: Date.now(),
      senderId: user?._id,
      senderName: user?.name || 'You',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setText('');
    setSending(false);

    // Simulate owner auto-reply after 1.5 s (remove once real backend is ready)
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        senderId: ownerId || 'owner',
        senderName: ownerName || 'Owner',
        text: 'Thanks for your message! I\'ll get back to you shortly.',
        timestamp: new Date().toISOString(),
        isAuto: true,
      };
      setMessages(prev => {
        const next = [...prev, reply];
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    }, 1500);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: 'linear-gradient(135deg,#0F172A,#1E3A5F)', background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563EB', fontSize: 14, fontWeight: 700 }}>
          {(ownerName || 'O')[0].toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>{ownerName || 'Property Owner'}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Owner · Usually replies quickly</Typography>
        </Box>
      </Box>

      <Divider />

      {/* Message List */}
      <Box sx={{ height: 280, overflowY: 'auto', p: 2, bgcolor: '#F8FAFF', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.length === 0 && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Send a message to the owner</Typography>
          </Box>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === user?._id;
          return (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <Box sx={{ maxWidth: '75%' }}>
                {!isMine && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>{msg.senderName}</Typography>
                )}
                <Box sx={{
                  px: 2, py: 1, borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  bgcolor: isMine ? '#2563EB' : 'white',
                  color: isMine ? 'white' : '#0F172A',
                  boxShadow: '0 2px 6px rgba(15,23,42,0.07)',
                  border: isMine ? 'none' : '1px solid #E2E8F0',
                }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.text}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.3, textAlign: isMine ? 'right' : 'left', px: 0.5 }}>
                  {formatTime(msg.timestamp)}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      <Divider />

      {/* Input Bar */}
      <Box sx={{ p: 1.5, bgcolor: 'white' }}>
        {!user ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
            Please log in to chat with the owner.
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              multiline
              maxRows={3}
              size="small"
              placeholder="Type a message…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFF' } }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!text.trim() || sending}
              sx={{
                bgcolor: '#2563EB', color: 'white', borderRadius: 2, p: 1.2,
                '&:hover': { bgcolor: '#1D4ED8' },
                '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
              }}
            >
              {sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
            </IconButton>
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default ChatBox;
