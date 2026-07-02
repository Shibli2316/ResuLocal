'use client';

import React, { useState, useEffect } from 'react';
import { Key, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Card, Input, Button, Alert, Space, Typography, Tooltip, message } from 'antd';
import { useResumeStore } from '../store/resumeStore';

const { Text, Link } = Typography;

export default function ApiKeyManager() {
  const { 
    userApiKey, 
    isUserApiKeyVerified, 
    setUserApiKey, 
    setApiKeyVerified 
  } = useResumeStore();

  const [enteredKey, setEnteredKey] = useState(userApiKey || '');
  const [verifying, setVerifying] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  // Check if server already has an API key in its .env on mount
  useEffect(() => {
    const checkServerKey = async () => {
      try {
        const response = await fetch('/api/ai/check-status');
        if (response.ok) {
          const data = await response.json();
          setHasServerKey(data.hasServerKey);
        }
      } catch (err) {
        console.error('Failed to check server API key status:', err);
      } finally {
        setCheckingServer(false);
      }
    };
    checkServerKey();
  }, []);

  const handleVerifyAndSave = async () => {
    const trimmed = enteredKey.trim();
    if (!trimmed) {
      message.warning('Please enter an API key first.');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/ai/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': trimmed,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUserApiKey(trimmed);
        setApiKeyVerified(true);
        message.success('Your Gemini API key has been verified and saved!');
      } else {
        throw new Error(result.error || 'Verification failed. Please check the key.');
      }
    } catch (err: any) {
      console.error(err);
      setApiKeyVerified(false);
      message.error(err.message || 'Verification failed. Ensure the key is active.');
    } finally {
      setVerifying(false);
    }
  };

  const handleClear = () => {
    setUserApiKey(null);
    setApiKeyVerified(false);
    setEnteredKey('');
    message.info('Custom API key cleared.');
  };

  // Determine current active credentials state
  const isActive = isUserApiKeyVerified && userApiKey;
  const isUsingDefault = !isActive && hasServerKey;
  const isNoKeyAvailable = !isActive && !hasServerKey;

  return (
    <Card 
      size="small" 
      className="mb-4 shadow-sm border-slate-300 bg-slate-50/50 backdrop-blur-sm"
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div className="flex flex-col gap-3">
        {/* Status Indicator Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Key size={13} className="text-teal-600" />
            <span>Gemini AI Connection</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            {checkingServer ? (
              <span className="text-slate-400 flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin" /> Checking credentials...
              </span>
            ) : isActive ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> Custom API Key Active
              </span>
            ) : isUsingDefault ? (
              <span className="text-teal-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> Server-side Default Key Active
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1 font-bold">
                <AlertCircle size={12} /> Mock Mode (No Key Detected)
              </span>
            )}
          </div>
        </div>

        {/* Info Notification Messages */}
        {isNoKeyAvailable && (
          <Alert
            message={
              <div className="text-[11px] leading-normal text-amber-800">
                You need a Google Gemini API Key to use the ATS Scanner & Cover Letter Generator. Without a key, the app will run in <strong>Mock Mode</strong>.
              </div>
            }
            type="warning"
            showIcon
            className="!py-1 !px-2.5 !border-amber-200 !bg-amber-50/50"
          />
        )}

        {isUsingDefault && !isActive && (
          <Alert
            message={
              <div className="text-[11px] leading-normal text-slate-600">
                Running on a default server-side API key. Enter a custom key below if you wish to override it with your own credentials.
              </div>
            }
            type="info"
            showIcon
            className="!py-1 !px-2.5 !border-slate-200 !bg-slate-100/50"
          />
        )}

        {/* Input Controls */}
        <div className="flex items-center gap-2">
          <Input.Password
            placeholder="AI Studio API Key (AIzaSy...)"
            value={enteredKey}
            onChange={(e) => setEnteredKey(e.target.value)}
            disabled={verifying}
            className="text-xs h-8 flex-1"
            size="small"
          />

          <Button 
            type="primary"
            size="small"
            onClick={handleVerifyAndSave}
            loading={verifying}
            className="h-8 !bg-teal-700 hover:!bg-teal-600 font-bold text-xs border-0"
          >
            Verify & Save
          </Button>

          {userApiKey && (
            <Tooltip title="Clear saved key">
              <Button
                type="default"
                size="small"
                danger
                icon={<Trash2 size={12} />}
                onClick={handleClear}
                className="h-8 flex items-center justify-center"
              />
            </Tooltip>
          )}

          <Button
            type="text"
            size="small"
            className="text-slate-400 hover:text-teal-600 h-8 p-1 flex items-center justify-center"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <HelpCircle size={15} />
          </Button>
        </div>

        {/* Instructions Collapsible Panel */}
        {(showInstructions || isNoKeyAvailable) && (
          <div className="border-t border-slate-200 pt-2.5 mt-0.5 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">How to get a Free Google Gemini API Key:</span>
            <ol className="list-decimal list-inside pl-1 space-y-1 text-[11px]">
              <li>Visit <Link href="https://aistudio.google.com/" target="_blank" className="font-semibold text-teal-600 hover:underline">Google AI Studio</Link> (sign in with your Google account).</li>
              <li>Click the prominent <Text strong className="text-[11px]">"Get API Key"</Text> button in the sidebar.</li>
              <li>Click <Text strong className="text-[11px]">"Create API Key"</Text>, select or create a project, copy the key (starts with <code>AIzaSy</code>), and paste it here.</li>
            </ol>
          </div>
        )}
      </div>
    </Card>
  );
}
