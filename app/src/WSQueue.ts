interface JSONMessage {
  [key: string]: any;
}

interface QueuedCommand {
  message: JSONMessage;
  resolve: () => void;
  reject: (error: Error) => void;
  timeout?: number;
}

class WSQueue {
  private ws: WebSocket;
  private url: string;
  private sendQueue: QueuedCommand[] = [];
  private currentId: number = 1;
  private pendingAcks: Map<number, QueuedCommand> = new Map();
  private maxConcurrent: number;
  private commandTimeout: number;
  private reconnecting: boolean = false;

  constructor(
    url: string,
    maxConcurrent: number = 10,
    commandTimeout: number = 5000
  ) {
    this.url = url;
    this.maxConcurrent = maxConcurrent;
    this.commandTimeout = commandTimeout;
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log("WebSocket opened");
      this.reconnecting = false;
      this.processQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle acknowledgment
        if (data.status === "ok" && data.ack !== undefined) {
          const pending = this.pendingAcks.get(data.ack);
          if (pending) {
            if (pending.timeout) clearTimeout(pending.timeout);
            this.pendingAcks.delete(data.ack);
            pending.resolve();
          }
        }
        // Handle errors
        else if (data.status === "error" && data.id !== undefined) {
          const pending = this.pendingAcks.get(data.id);
          if (pending) {
            if (pending.timeout) clearTimeout(pending.timeout);
            this.pendingAcks.delete(data.id);
            pending.reject(new Error(data.error || "Unknown error"));
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.warn("WebSocket closed");
      this.handleDisconnect();
    };

    // Start processing the queue
    this.processQueue();
  }

  private handleDisconnect() {
    // Reject all pending commands
    this.pendingAcks.forEach((pending) => {
      if (pending.timeout) clearTimeout(pending.timeout);
      pending.reject(new Error("WebSocket disconnected"));
    });
    this.pendingAcks.clear();

    // Optionally reject queued commands or keep them for reconnect
    // For now, we'll keep them and try to reconnect
    if (!this.reconnecting) {
      this.reconnecting = true;
      console.log("Attempting to reconnect...");
      // You might want to add reconnection logic here
    }
  }

  /**
   * Queue a message to be sent over the WebSocket
   * Only waits for ACK if we're at the concurrent limit
   * Returns a promise that resolves when the command is acknowledged (if we need to wait)
   */
  public queueSend(msg: JSONMessage): Promise<void> | void {
    const msgWithId = { ...msg, id: this.currentId++ };
    
    // If we're below the limit, send immediately without waiting
    if (this.pendingAcks.size < this.maxConcurrent && this.ws.readyState === WebSocket.OPEN) {
      return this.sendImmediate(msgWithId);
    }
    
    // Otherwise, queue and wait
    return new Promise((resolve, reject) => {
      this.sendQueue.push({
        message: msgWithId,
        resolve,
        reject,
      });
    });
  }

  /**
   * Send a message immediately without queueing (internal use)
   */
  private sendImmediate(msgWithId: JSONMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      const msgId = msgWithId.id;

      // Set up timeout
      const timeout = setTimeout(() => {
        const pending = this.pendingAcks.get(msgId);
        if (pending) {
          this.pendingAcks.delete(msgId);
          pending.reject(
            new Error(
              `Command ${msgId} (${msgWithId.cmd}) timed out after ${this.commandTimeout}ms`
            )
          );
        }
      }, this.commandTimeout);

      // Store in pending map
      this.pendingAcks.set(msgId, {
        message: msgWithId,
        resolve,
        reject,
        timeout,
      });

      // Send the message
      try {
        this.ws.send(JSON.stringify(msgWithId));
        console.log(
          `Sent: ${msgWithId.cmd} (ID: ${msgId}) | Pending: ${this.pendingAcks.size}/${this.maxConcurrent} | Queued: ${this.sendQueue.length}`
        );
      } catch (error) {
        // Failed to send, reject immediately
        clearTimeout(timeout);
        this.pendingAcks.delete(msgId);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Process the queue, sending messages when:
   * 1. WebSocket is open
   * 2. We have queued messages
   * 3. We haven't reached the concurrent limit
   */
  private processQueue = () => {
    if (
      this.ws.readyState === WebSocket.OPEN &&
      this.sendQueue.length > 0 &&
      this.pendingAcks.size < this.maxConcurrent
    ) {
      const queuedCmd = this.sendQueue.shift()!;
      const msgId = queuedCmd.message.id;

      // Set up timeout
      const timeout = setTimeout(() => {
        const pending = this.pendingAcks.get(msgId);
        if (pending) {
          this.pendingAcks.delete(msgId);
          pending.reject(
            new Error(
              `Command ${msgId} (${queuedCmd.message.cmd}) timed out after ${this.commandTimeout}ms`
            )
          );
        }
      }, this.commandTimeout);

      queuedCmd.timeout = timeout;

      // Store in pending map
      this.pendingAcks.set(msgId, queuedCmd);

      // Send the message
      try {
        this.ws.send(JSON.stringify(queuedCmd.message));
        console.log(
          `Sent: ${queuedCmd.message.cmd} (ID: ${msgId}) | Pending: ${this.pendingAcks.size}/${this.maxConcurrent} | Queued: ${this.sendQueue.length}`
        );
      } catch (error) {
        // Failed to send, reject immediately
        if (timeout) clearTimeout(timeout);
        this.pendingAcks.delete(msgId);
        queuedCmd.reject(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    // Schedule next processing iteration
    requestAnimationFrame(this.processQueue);
  };

  /**
   * Get current queue statistics
   */
  public getStats() {
    return {
      connected: this.ws.readyState === WebSocket.OPEN,
      queued: this.sendQueue.length,
      pending: this.pendingAcks.size,
      total: this.sendQueue.length + this.pendingAcks.size,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Wait for all pending commands to complete
   */
  public async flush(): Promise<void> {
    while (this.sendQueue.length > 0 || this.pendingAcks.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /**
   * Clear all queued commands (does not affect commands already sent)
   */
  public clearQueue() {
    const rejected = this.sendQueue.length;
    this.sendQueue.forEach((cmd) => {
      cmd.reject(new Error("Queue cleared"));
    });
    this.sendQueue = [];
    console.log(`Cleared ${rejected} queued commands`);
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Update the WebSocket URL and reconnect
   * Clears all pending commands and establishes a new connection
   */
  public updateUrl(newUrl: string) {
    console.log(`Updating WebSocket URL from ${this.url} to ${newUrl}`);
    
    // Store new URL
    this.url = newUrl;
    
    // Clear queue and pending commands
    this.clearQueue();
    this.pendingAcks.forEach((pending) => {
      if (pending.timeout) clearTimeout(pending.timeout);
      pending.reject(new Error("Connection URL changed"));
    });
    this.pendingAcks.clear();
    
    // Close old connection
    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnection logic
      this.ws.close();
    }
    
    // Create new connection
    this.reconnecting = false;
    this.ws = new WebSocket(newUrl);
    
    this.ws.onopen = () => {
      console.log("WebSocket opened");
      this.reconnecting = false;
      this.processQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle acknowledgment
        if (data.status === "ok" && data.ack !== undefined) {
          const pending = this.pendingAcks.get(data.ack);
          if (pending) {
            if (pending.timeout) clearTimeout(pending.timeout);
            this.pendingAcks.delete(data.ack);
            pending.resolve();
          }
        }
        // Handle errors
        else if (data.status === "error" && data.id !== undefined) {
          const pending = this.pendingAcks.get(data.id);
          if (pending) {
            if (pending.timeout) clearTimeout(pending.timeout);
            this.pendingAcks.delete(data.id);
            pending.reject(new Error(data.error || "Unknown error"));
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.warn("WebSocket closed");
      this.handleDisconnect();
    };
  }

  /**
   * Send a ping and wait for pong response
   * Returns true if pong received, false if timeout
   */
  public async ping(): Promise<boolean> {
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.warn("Cannot ping: WebSocket not open");
      return false;
    }

    return new Promise((resolve) => {
      const pingTimeout = setTimeout(() => {
        this.ws.removeEventListener("message", handler);
        console.warn("Ping timeout - no pong received");
        resolve(false);
      }, 3000);

      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === "ok" && data.message === "pong") {
            clearTimeout(pingTimeout);
            this.ws.removeEventListener("message", handler);
            console.log("Pong received");
            resolve(true);
          }
        } catch (error) {
          // Not JSON or not our pong, ignore
        }
      };

      this.ws.addEventListener("message", handler);
      
      // Send ping message
      try {
        this.ws.send("ping");
        console.log("Ping sent");
      } catch (error) {
        clearTimeout(pingTimeout);
        this.ws.removeEventListener("message", handler);
        console.error("Failed to send ping:", error);
        resolve(false);
      }
    });
  }

  /**
   * Get current WebSocket URL
   */
  public getUrl(): string {
    return this.url;
  }

  /**
   * Close the WebSocket connection
   */
  public close() {
    this.clearQueue();
    this.ws.close();
  }
}

export default WSQueue;