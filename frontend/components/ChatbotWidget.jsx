import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  Calendar,
  Ticket,
  ShoppingBag,
  DollarSign,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Check,
  Zap,
} from 'lucide-react';

const PREDEFINED_CATEGORIES = [
  { id: 'all', label: '🌟 All Topics' },
  { id: 'events', label: '🎟️ Events & Tickets' },
  { id: 'merch', label: '👕 Merchandise' },
  { id: 'finance', label: '💰 Treasury & Finance' },
  { id: 'roles', label: '👑 Roles & Access' },
];

const PREDEFINED_QA = [
  {
    id: 'events-register',
    category: 'events',
    question: 'How do I register for an event or get a ticket?',
    shortLabel: '🎟️ How to get event tickets',
    answer:
      'You can browse upcoming events in the **Events** tab. For any open event, click **"Get Ticket"** in the **Tickets & Attendance** portal to generate your unique admission pass. Your active QR ticket will be instantly saved in your wallet!',
    actionLink: '/tickets',
    actionLabel: 'Go to Tickets Wallet',
    keywords: ['ticket', 'event', 'register', 'rsvp', 'pass', 'admission'],
  },
  {
    id: 'checkin-staff',
    category: 'events',
    question: 'How does the ticket check-in desk work for event staff?',
    shortLabel: '📱 Staff check-in desk guide',
    answer:
      'Volunteers, Organizers, and Admins can switch to the **"Check-in Desk"** tab inside the Tickets section. Enter or scan any attendee’s unique ticket code (e.g. `TCK-ADM-HACK01`) to verify validity and mark their attendance in real time.',
    actionLink: '/tickets',
    actionLabel: 'Open Check-in Desk',
    keywords: ['checkin', 'check in', 'desk', 'qr', 'verify', 'volunteer', 'staff'],
  },
  {
    id: 'merch-browse',
    category: 'merch',
    question: 'What official club merchandise is currently available?',
    shortLabel: '👕 Browse club merchandise',
    answer:
      'Our official store features premium embroidered tees, heavyweight fleece hoodies, snapback caps, insulated thermal water bottles, and padded laptop sleeves. Browse items, pick your sizes, and place orders directly.',
    actionLink: '/merchandise',
    actionLabel: 'Browse Merchandise Store',
    keywords: ['merch', 'merchandise', 'store', 't-shirt', 'hoodie', 'shop', 'order'],
  },
  {
    id: 'orders-track',
    category: 'merch',
    question: 'How do I track my merchandise order status?',
    shortLabel: '📦 Track merchandise orders',
    answer:
      'Navigate to the **Orders** section to view your fulfillment history. You will see itemized breakdowns, total costs, order timestamps, and live statuses (Pending, Confirmed, Shipped, or Delivered).',
    actionLink: '/orders',
    actionLabel: 'View Orders History',
    keywords: ['order', 'track', 'status', 'shipping', 'delivery', 'history'],
  },
  {
    id: 'finance-reimb',
    category: 'finance',
    question: 'How do I submit an expense reimbursement request?',
    shortLabel: '🧾 Submit expense reimbursement',
    answer:
      'Members and organizers can submit reimbursement claims under **Finance ➔ Reimbursements**. Attach your itemized receipt URL and description. The Treasurer or Admin reviews and approves pending claims with automatic budget updates.',
    actionLink: '/finance',
    actionLabel: 'Open Finance & Reimbursements',
    keywords: ['reimburse', 'reimbursement', 'expense', 'receipt', 'money', 'claim', 'finance'],
  },
  {
    id: 'finance-budget',
    category: 'finance',
    question: 'Who can view organization budgets & financial summaries?',
    shortLabel: '📊 Treasury balance & reports',
    answer:
      'Admins and Treasurers have complete access to the **Finance Summary Dashboard**, tracking real-time membership dues, corporate sponsorships, merchandise revenue, venue deposits, and active balances.',
    actionLink: '/finance',
    actionLabel: 'View Treasury Summary',
    keywords: ['budget', 'treasury', 'income', 'balance', 'profit', 'accounting', 'treasurer'],
  },
  {
    id: 'demo-roles',
    category: 'roles',
    question: 'What demo accounts are available to test the platform?',
    shortLabel: '⚡ Demo accounts & test logins',
    answer:
      'Student_OS provides 5 instant 1-click test roles: **Admin** (`admin@studentos.com`), **Volunteer** (`volunteer@studentos.com`), **Student** (`student@studentos.com`), **Organizer** (`organizer@studentos.com`), and **Treasurer** (`treasurer@studentos.com`). Use the **Demo Switcher** in the top header to switch accounts in 1 click!',
    actionLink: '/auth',
    actionLabel: 'View Demo Accounts on Login',
    keywords: ['demo', 'admin', 'volunteer', 'student', 'organizer', 'treasurer', 'role', 'login'],
  },
  {
    id: 'announcements-view',
    category: 'roles',
    question: 'Where can I see official organization bulletins & notices?',
    shortLabel: '📢 Official announcements',
    answer:
      'Check the **Announcements** page for campus bulletins, general meeting schedules, and urgent notifications. Officers can also draft and pin new announcements for all members.',
    actionLink: '/announcements',
    actionLabel: 'Read Announcements',
    keywords: ['announcement', 'bulletin', 'notice', 'meeting', 'news'],
  },
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! 👋 I am your **Student_OS AI Assistant**. How can I help you manage your student organization today?',
      suggestions: PREDEFINED_QA.slice(0, 4),
      time: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [ratedMessages, setRatedMessages] = useState({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSelectPredefined = (qaItem) => {
    // Add user question message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: qaItem.question,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: qaItem.answer,
        actionLink: qaItem.actionLink,
        actionLabel: qaItem.actionLabel,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 450);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Find best matching predefined answer
    const queryLower = query.toLowerCase();
    const match = PREDEFINED_QA.find(
      (item) =>
        item.question.toLowerCase().includes(queryLower) ||
        item.keywords.some((k) => queryLower.includes(k))
    );

    setTimeout(() => {
      setIsTyping(false);
      let botMsg;
      if (match) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: match.answer,
          actionLink: match.actionLink,
          actionLabel: match.actionLabel,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `I found relevant sections for **"${query}"**. Choose one of the quick topics below or navigate directly to the workspace modules.`,
          suggestions: PREDEFINED_QA.slice(0, 3),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Hello! 👋 I am your **Student_OS AI Assistant**. How can I help you manage your student organization today?',
        suggestions: PREDEFINED_QA.slice(0, 4),
        time: 'Just now',
      },
    ]);
  };

  const handleRate = (msgId, isPositive) => {
    setRatedMessages((prev) => ({ ...prev, [msgId]: isPositive }));
  };

  const filteredQA =
    selectedCategory === 'all'
      ? PREDEFINED_QA
      : PREDEFINED_QA.filter((q) => q.category === selectedCategory);

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* ─── Floating Launcher Bubble ─── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 backdrop-blur-md cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-sky-700 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold block leading-tight flex items-center gap-1">
              Ask AI Assistant <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
            <span className="text-[10px] text-sky-200 font-normal">FAQs</span>
          </div>
        </button>
      )}

      {/* ─── Premium Chat Modal Window ─── */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-4 flex items-center justify-between border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">Student_OS AI</h3>
                  <span className="text-[10px] px-1.5 py-0.2 bg-sky-500/20 text-sky-300 rounded font-mono border border-sky-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Instant Predefined Answers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Predefined Topic Categories Pill Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {PREDEFINED_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-2xl rounded-tr-xs p-3 text-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 text-xs shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Optional Action Button Link */}
                  {msg.actionLink && (
                    <div className="pt-1.5 border-t border-slate-100 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(msg.actionLink);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold rounded-md text-[11px] transition-colors border border-sky-200 cursor-pointer"
                      >
                        <span>{msg.actionLabel || 'Navigate'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Predefined Quick Suggestion Chips */}
                  {msg.suggestions && (
                    <div className="pt-2 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Suggested Inquiries:
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestions.map((qa) => (
                          <button
                            key={qa.id}
                            type="button"
                            onClick={() => handleSelectPredefined(qa)}
                            className="text-left p-2 rounded-lg bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 text-slate-700 hover:text-sky-800 text-[11px] transition-all flex items-center justify-between group cursor-pointer"
                          >
                            <span className="font-medium truncate">{qa.shortLabel}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Footer / Feedback */}
                  {msg.sender === 'bot' && (
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{msg.time}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRate(msg.id, true)}
                          className={`p-1 hover:text-emerald-600 rounded transition-colors ${
                            ratedMessages[msg.id] === true ? 'text-emerald-600 font-bold' : ''
                          }`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRate(msg.id, false)}
                          className={`p-1 hover:text-rose-600 rounded transition-colors ${
                            ratedMessages[msg.id] === false ? 'text-rose-600 font-bold' : ''
                          }`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Animation */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Predefined Questions Carousel in Footer */}
          <div className="p-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap pl-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Fast Questions:
            </span>
            {filteredQA.slice(0, 4).map((qa) => (
              <button
                key={qa.id}
                type="button"
                onClick={() => handleSelectPredefined(qa)}
                className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
              >
                {qa.shortLabel}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything or pick a predefined question..."
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

