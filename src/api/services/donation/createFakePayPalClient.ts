import * as paypal from "@paypal/checkout-server-sdk";
import * as paypalHttp from "@paypal/paypalhttp";

export function createFakePayPalClient(fakeDB: paypal.orders.Order[]) {
  function create(request: paypal.orders.OrdersCreateRequest) {
    request.body.id = " fake";
    fakeDB.push(request.body);
    return request.body;
  }

  function find() {
    return fakeDB[0];
  }

  function capture() {
    const order = find();
    if (order) {
      order.status = "COMPLETED" as paypal.payments.Status;
      const unit = order.purchase_units[0];
      unit.payments = {
        captures: [{ amount: unit.amount } as paypal.payments.Capture],
      } as paypal.orders.PaymentCollection;
    }
    return order;
  }

  function refund(request: paypal.payments.CapturesRefundRequest) {
    return { status: "COMPLETED" } as paypal.payments.Capture;
  }

  class FakePayPalClient {
    async execute(request: unknown): Promise<FakeHttpResponse<unknown>> {
      if (request instanceof paypal.orders.OrdersCreateRequest) {
        return { result: create(request) };
      }
      if (request instanceof paypal.orders.OrdersGetRequest) {
        return { result: find() };
      }
      if (request instanceof paypal.orders.OrdersCaptureRequest) {
        return { result: capture() };
      }
      if (request instanceof paypal.payments.CapturesRefundRequest) {
        return { result: refund(request) };
      }
      throw new Error(`No fake available for request: ${request}`);
    }
  }
  return new FakePayPalClient() as paypal.core.PayPalHttpClient;
}

type FakeHttpResponse<T> = Pick<paypalHttp.HttpResponse<unknown>, "result">;
