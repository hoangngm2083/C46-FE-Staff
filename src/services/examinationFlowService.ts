import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { useMutation } from "@tanstack/react-query";
import SockJS from "sockjs-client";
import { axiosInstance } from "./axios-instance";
export interface QueueItemDetails {
  queueItemId: string;
  medicalForm?: {
    id: string;
    examination?: {
      id: string;
      patientId: string;
      patientName?: string;
      patientEmail?: string;
      appointmentId?: string;
      status?: string;
      // Add other exam details as needed
    };
    invoice?: InvoiceDetails;
    medicalFormStatus: string;
  };
  requestedService?: {
    serviceId: string;
    name: string;
    processingPriority: number;
    departmentId: string;
    formTemplate: string;
  };
}

export interface QueueItemResponse {
  queueItemId: string;
  medicalForm?: QueueItemDetails["medicalForm"];
  requestedService?: QueueItemDetails["requestedService"];
}

export interface InvoiceDetails {
  invoiceId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  medicalPackages: any[];
  totalAmount: number;
  status: string;
}

type MessageHandler = (message: any) => void;
type ErrorHandler = (error: string) => void;

class ExaminationFlowService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private baseUrl: string = import.meta.env.VITE_SOCKET_URL || ""; // ExaminationFlowService port
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  /**
   * Connect to the ExaminationFlow WebSocket
   * @param token JWT token for authentication
   * @param onConnected Callback when connection is established
   * @param onError Callback when connection error occurs
   */
  connect(
    token: string,
    onConnected?: () => void,
    onError?: (error: any) => void
  ): void {
    if (this.connected && this.client?.active) {
      console.log("Already connected to ExaminationFlow WebSocket");
      onConnected?.();
      return;
    }

    // Create SockJS instance
    const socket = new SockJS(`${this.baseUrl}/ws/exam-workflow`);

    this.client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str: string) => {
        console.log("[STOMP Debug]", str);
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log("Connected to ExaminationFlow WebSocket");
        this.connected = true;
        this.reconnectAttempts = 0;
        onConnected?.();
      },
      onStompError: (frame: any) => {
        console.error("STOMP error:", frame);
        this.connected = false;
        onError?.(frame);
      },
      onWebSocketError: (event: any) => {
        console.error("WebSocket error:", event);
        this.connected = false;
        onError?.(event);
      },
      onDisconnect: () => {
        console.log("Disconnected from ExaminationFlow WebSocket");
        this.connected = false;
        this.handleReconnect(token, onConnected, onError);
      },
    });

    this.client.activate();
  }

  private handleReconnect(
    token: string,
    onConnected?: () => void,
    onError?: (error: any) => void
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => {
        this.connect(token, onConnected, onError);
      }, this.reconnectDelay);
    } else {
      console.error("Max reconnection attempts reached");
      onError?.(new Error("Max reconnection attempts reached"));
    }
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    if (this.client?.active) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.client.deactivate();
      this.connected = false;
      console.log("Disconnected from ExaminationFlow WebSocket");
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected && this.client?.active === true;
  }

  /**
   * Subscribe to receive queue item details when available
   * @param onItemReceived Callback when queue item is received
   */
  subscribeToQueueItems(onItemReceived: MessageHandler): void {
    if (!this.client?.active) {
      console.error("WebSocket not connected. Call connect() first.");
      return;
    }

    const subscription = this.client.subscribe(
      "/user/queue/exam-workflow/item/details",
      (message: IMessage) => {
        try {
          const data: QueueItemResponse = JSON.parse(message.body);
          console.log("Received queue item:", data);
          onItemReceived(data);
        } catch (error) {
          console.error("Error parsing queue item:", error);
        }
      }
    );

    this.subscriptions.set("queueItems", subscription);
  }

  /**
   * Subscribe to queue size updates
   * @param onQueueSizeReceived Callback when queue size is received
   */
  subscribeToQueueSize(onQueueSizeReceived: (size: number) => void): void {
    if (!this.client?.active) {
      console.error("WebSocket not connected. Call connect() first.");
      return;
    }

    const subscription = this.client.subscribe(
      "/user/queue/query-size-reply",
      (message: IMessage) => {
        try {
          const size = JSON.parse(message.body) as number;
          console.log("Received queue size:", size);
          onQueueSizeReceived(size);
        } catch (error) {
          console.error("Error parsing queue size:", error);
        }
      }
    );

    this.subscriptions.set("queueSize", subscription);
  }

  /**
   * Subscribe to error messages
   * @param onError Callback when error is received
   */
  subscribeToErrors(onError: ErrorHandler): void {
    if (!this.client?.active) {
      console.error("WebSocket not connected. Call connect() first.");
      return;
    }

    const subscription = this.client.subscribe(
      "/user/queue/errors",
      (message: IMessage) => {
        try {
          const errorMessage = message.body;
          console.error("Received error:", errorMessage);
          onError(errorMessage);
        } catch (error) {
          console.error("Error parsing error message:", error);
        }
      }
    );

    this.subscriptions.set("errors", subscription);
  }

  /**
   * Subscribe to broadcast queue updates for a specific queue
   * @param queueId Queue ID (usually departmentId)
   * @param onQueueUpdate Callback when queue is updated
   */
  subscribeToQueueBroadcast(
    queueId: string,
    onQueueUpdate: MessageHandler
  ): void {
    if (!this.client?.active) {
      console.error("WebSocket not connected. Call connect() first.");
      return;
    }

    const subscription = this.client.subscribe(
      `/topic/exam-workflow/queue/${queueId}/list`,
      (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          console.log("Received queue broadcast:", data);
          onQueueUpdate(data);
        } catch (error) {
          console.error("Error parsing queue broadcast:", error);
        }
      }
    );

    this.subscriptions.set(`queueBroadcast-${queueId}`, subscription);
  }

  /**
   * Subscribe to reception queue updates
   * @param onQueueUpdate Callback when queue is updated
   */
  subscribeToReceptionQueue(onQueueUpdate: MessageHandler): void {
    this.subscribeToQueueBroadcast("reception", onQueueUpdate);
  }

  /**
   * Request to take the next item from the queue
   * @param queueId Queue ID (usually departmentId)
   */
  takeNextItem(queueId: string): void {
    if (!this.client?.active) {
      console.error("WebSocket not connected. Call connect() first.");
      return;
    }

    this.client.publish({
      destination: "/app/exam-workflow/queue/take-next",
      body: JSON.stringify({ queueId }),
    });

    console.log("Requested next item from queue:", queueId);
  }

  /**
   * Get the current in-progress item for the staff
   */
  getInProgressItem(): void {
    if (!this.client?.active) {
      console.error("WebSocket not connected. Call connect() first.");
      return;
    }

    this.client.publish({
      destination: "/app/exam-workflow/item/in-process",
      body: "",
    });

    console.log("Requested in-progress item");
  }

  /**
   * Query the queue size for a specific queue
   * @param queueId Queue ID (usually departmentId)
   */
  queryQueueSize(queueId: string): void {
    if (!this.client?.active) {
      console.error("WebSocket not connected. Call connect() first.");
      return;
    }

    this.client.publish({
      destination: "/app/exam-workflow/query/queue-size",
      body: queueId,
    });

    console.log("Queried queue size for:", queueId);
  }
}

// Export singleton instance
export const examinationFlowService = new ExaminationFlowService();

interface ICreateMedicalFormRequest {
  patientId: string;
  medicalPackageIds: string[];
}

export const useExaminationFlowService = () => {
  const createMedicalForm = useMutation({
    mutationFn: (args: ICreateMedicalFormRequest) =>
      axiosInstance
        .post<{
          appointmentId: string;
        }>("/medical-form", args)
        .then((res) => res.data),
  });

  return {
    createMedicalForm,
  };
};
