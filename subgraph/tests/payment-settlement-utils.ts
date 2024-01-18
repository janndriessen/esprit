import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  EIP712DomainChanged,
  OwnershipTransferred,
  Paused,
  Payment,
  Unpaused
} from "../generated/PaymentSettlement/PaymentSettlement"

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

  eip712DomainChangedEvent.parameters = new Array()

  return eip712DomainChangedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createPaymentEvent(
  token: Address,
  from: Address,
  to: Address,
  amount: BigInt
): Payment {
  let paymentEvent = changetype<Payment>(newMockEvent())

  paymentEvent.parameters = new Array()

  paymentEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  paymentEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  paymentEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  paymentEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return paymentEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
