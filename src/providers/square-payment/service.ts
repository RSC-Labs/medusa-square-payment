import { AbstractPaymentProvider, MedusaError, PaymentActions } from "@medusajs/framework/utils"
import { AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, CapturePaymentInput, CapturePaymentOutput, DeletePaymentInput, DeletePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, InitiatePaymentInput, InitiatePaymentOutput, Logger, PaymentSessionStatus, ProviderWebhookPayload, RefundPaymentInput, RefundPaymentOutput, RetrievePaymentInput, RetrievePaymentOutput, UpdatePaymentInput, UpdatePaymentOutput, WebhookActionResult } from "@medusajs/framework/types"
import { AbstractEventBusModuleService, defaultCurrencies } from "@medusajs/utils";
import { Square, SquareClient, SquareEnvironment } from "square";
import { randomUUID } from 'crypto';

type Options = {
  token: string,
  environment?: string,
}

type InjectedDependencies = {
  logger: Logger,
  event_bus: AbstractEventBusModuleService
}

class SquarePaymentProviderService extends AbstractPaymentProvider<
  Options
> {

  static identifier = "square-payment"

  protected logger_: Logger
  protected options_: Options
  protected square_: SquareClient;
  protected eventBusService_: AbstractEventBusModuleService
  constructor(
    container: InjectedDependencies,
    options: Options
  ) {
    super(container, options)

    this.logger_ = container.logger
    this.options_ = options
    this.eventBusService_ = container.event_bus

    this.square_ = new SquareClient({
      token: this.options_.token,
      environment: this.options_.environment === 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production
    })
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.token) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "token is required in the provider's options."
      )
    }
    if (options.environment) {
      if (options.environment !== 'production' && options.environment !== "sandbox") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "environment needs to be either production or sandbox"
        )
      }
    }
  }

  async capturePayment(paymentData: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return {
      data: paymentData,
    }
  }

  async authorizePayment(paymentData: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    return {
      ...paymentData,
      status: paymentData.data && paymentData.data.status === 'COMPLETED' ? 'captured' : 'pending',
    }
  }
  async cancelPayment(paymentData: CancelPaymentInput): Promise<CancelPaymentOutput> {
    throw new Error("cancelPayment Method not implemented.")
  }
  async initiatePayment(paymentData: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const result = await this.square_.payments.create({
      idempotencyKey: randomUUID(),
      sourceId: paymentData.data!.token as string,
      amountMoney: {
        currency: paymentData.currency_code.toUpperCase() as Square.Currency,
        // currency: "USD",
        amount: BigInt(paymentData.amount as number * 100)
      }
    })

    if (result.payment && result.payment.id) {
      return {
        id: result.payment.id,
        data: {
          ...paymentData,
          status: result.payment.status,
        }
      }
    }

    throw new Error("initpayment no context provided")
  }
  async deletePayment(paymentSessionData: DeletePaymentInput): Promise<DeletePaymentOutput> {
    throw new Error("deletePayment Method not implemented.")
  }
  async getPaymentStatus(paymentData: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    throw new Error("getPaymentStatus Method not implemented.")
  }
  async refundPayment(paymentData: RefundPaymentInput): Promise<RefundPaymentOutput> {
    throw new Error("refundPayment Method not implemented.")
  }
  async retrievePayment(paymentSessionData: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    throw new Error("retrievePayment Method not implemented.")
  }
  async updatePayment(context: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    throw new Error("updatePayment Method not implemented.")
  }
  async getWebhookActionAndData(data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    return {
      action: PaymentActions.NOT_SUPPORTED
    }
  }
}

export default SquarePaymentProviderService