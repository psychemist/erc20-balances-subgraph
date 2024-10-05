import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { W3CXI, Approval, Transfer } from "../generated/W3CXI/W3CXI"
import { User, Balance } from "../generated/schema"
import { loadOrCreateUser } from "./utils"

export function handleApproval(event: Approval): void {
  // Approval events don't affect user balances, so we don't need to do anything here
  let ownerId = event.params.owner.toHexString()
  let owner = loadOrCreateUser(ownerId)
  owner.save()

  let spenderId = event.params.spender.toHexString()
  let spender = loadOrCreateUser(spenderId)
  spender.save()
}

export function handleTransfer(event: Transfer): void {
  let fromAddress = event.params.from.toHexString()
  let toAddress = event.params.to.toHexString()
  let amount = event.params.value

  // Handle 'from' user
  let fromUser = User.load(fromAddress)
  if (fromUser == null) {
    fromUser = new User(fromAddress)
    let fromBalance = new Balance(fromAddress)
    fromBalance.amount = BigInt.fromI32(0)
    fromBalance.user = fromUser.id
    fromBalance.save()
    fromUser.balance = fromBalance.id
    fromUser.save()
  }

  let fromBalance = Balance.load(fromUser.balance)
  if (fromBalance != null) {
    fromBalance.amount = fromBalance.amount.minus(amount)
    fromBalance.save()
  }

  // Handle 'to' user
  let toUser = User.load(toAddress)
  if (toUser == null) {
    toUser = new User(toAddress)
    let toBalance = new Balance(toAddress)
    toBalance.amount = BigInt.fromI32(0)
    toBalance.user = toUser.id
    toBalance.save()
    toUser.balance = toBalance.id
    toUser.save()
  }

  let toBalance = Balance.load(toUser.balance)
  if (toBalance != null) {
    toBalance.amount = toBalance.amount.plus(amount)
    toBalance.save()
  }
}
