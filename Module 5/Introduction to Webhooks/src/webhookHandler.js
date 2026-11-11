'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  if (
    !Buffer.isBuffer(req.body) ||
    typeof signature !== 'string' ||
    !/^sha256=[\da-f]{64}$/i.test(signature)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('WEBHOOK_SECRET must be configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest();
  const receivedSignature = Buffer.from(signature.slice('sha256='.length), 'hex');

  if (!crypto.timingSafeEqual(expectedSignature, receivedSignature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (event === null || typeof event !== 'object' || event.id === undefined || event.id === null) {
    return res.status(400).json({ error: 'Event id is required' });
  }

  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  _processedIds.add(event.id);
  res.status(200).json({ status: 'received' });
  setImmediate(() => handleEvent(event));
}

module.exports = { handleWebhook, _processedIds };
