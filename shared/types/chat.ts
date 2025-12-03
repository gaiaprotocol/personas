export type PersonaChatMessage = {
  id: number;
  personaAddress: string;
  sender: string;           // EVM address
  senderIp: string | null;

  content: string;
  attachments: unknown | null;
  parentMessageId: number | null;

  createdAt: number;        // epoch seconds
  updatedAt: number | null;

  isDeleted: boolean;
  deletedAt: number | null;
};

export type PersonaChatReaction = {
  messageId: number;
  reactor: string;          // EVM address
  reactionType: string;     // 'heart', '👍', ...
  createdAt: number;
};

export type PersonaChatMessagesResponse = {
  messages: PersonaChatMessage[];
  nextCursor: number | null;
};

export type PersonaChatReactionsResponse = {
  reactions: PersonaChatReaction[];
  counts: Record<string, number>;
};
