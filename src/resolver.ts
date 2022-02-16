import {
  ABIChanged as ABIChangedEvent,
  AddrChanged as AddrChangedEvent,
  AddressChanged as AddressChangedEvent,
  AuthorisationChanged as AuthorisationChangedEvent,
  ContenthashChanged as ContenthashChangedEvent,
  InterfaceChanged as InterfaceChangedEvent,
  NameChanged as NameChangedEvent,
  PubkeyChanged as PubkeyChangedEvent,
  TextChanged as TextChangedEvent,
} from './types/Resolver/Resolver'

import {
  Account,
  Domain,
  Resolver,
  AddrChanged,
  MulticoinAddrChanged,
  NameChanged,
  AbiChanged,
  PubkeyChanged,
  ContenthashChanged,
  InterfaceChanged,
  AuthorisationChanged,
  TextChanged,
} from './types/schema'

import { Bytes, Address, ethereum, BigInt, log } from "@graphprotocol/graph-ts";

export function handleAddrChanged(event: AddrChangedEvent): void {
  const nodeHash = event.params.node.toHexString()
  // namehash('resolver.eth')
  if (nodeHash !== "0xfdd5d5de6dd63db72bbc2d487944ba13bf775b50a80805fe6fcaba9b0fba88f5") {
    return
  }

  let account = new Account(event.params.a.toHexString())
  account.save()

  let resolver = getOrCreateResolver(event.params.node, event.address)
  resolver.domain = event.params.node.toHexString()
  resolver.address = event.address
  resolver.addr = event.params.a.toHexString()
  resolver.save()

  let domain = Domain.load(event.params.node.toHexString())
  if(domain && domain.resolver == resolver.id) {
    domain.resolvedAddress = event.params.a.toHexString()
    domain.save()
  }

  let resolverEvent = new AddrChanged(createEventID(event))
  resolverEvent.resolver = resolver.id
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.addr = event.params.a.toHexString()
  resolverEvent.save()
}

export function handleMulticoinAddrChanged(event: AddressChangedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)
  resolver.domain = event.params.node.toHexString()
  resolver.address = event.address
  resolver.addr = event.params.newAddress.toHexString()

  let coinType = event.params.coinType
  if(resolver.coinTypes == null) {
    resolver.coinTypes = [coinType];
    resolver.save();
  } else {
    let coinTypes = resolver.coinTypes!
    if(!coinTypes.includes(coinType)){
      coinTypes.push(coinType)
      resolver.coinTypes = coinTypes
      resolver.save()
    }
  }

  // coinType SMARTBCH
  log.info("coin type= {} bigint ={} bool = {}", [event.params.coinType.toHexString(), 
    BigInt.fromU32(2147493648).toHexString(), event.params.coinType.equals(BigInt.fromU32(2147493648)) ? "yes" : "no"])
  if (event.params.coinType.equals(BigInt.fromU32(2147493648))) {
    let domain = Domain.load(event.params.node.toHexString())
    log.info("domain.resolver={} resolver.id={}", [domain!.resolver!, resolver.id])
    if(domain && domain.resolver == resolver.id) {
      domain.resolvedAddress = event.params.newAddress.toHexString()
      domain.save()
    }
  }

  let resolverEvent = new MulticoinAddrChanged(createEventID(event))
  resolverEvent.resolver = resolver.id
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.coinType = coinType
  resolverEvent.addr = event.params.newAddress
  resolverEvent.save()
}

export function handleNameChanged(event: NameChangedEvent): void {
  if(event.params.name.indexOf("\u0000") != -1) return;
  
  let resolverEvent = new NameChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.name = event.params.name
  resolverEvent.save()
}

export function handleABIChanged(event: ABIChangedEvent): void {
  let resolverEvent = new AbiChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.contentType = event.params.contentType
  resolverEvent.save()
}

export function handlePubkeyChanged(event: PubkeyChangedEvent): void {
  let resolverEvent = new PubkeyChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.x = event.params.x
  resolverEvent.y = event.params.y
  resolverEvent.save()
}

export function handleTextChanged(event: TextChangedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)
  let key = event.params.key;
  if(resolver.texts == null) {
    resolver.texts = [key];
    resolver.save();
  } else {
    let texts = resolver.texts!
    if(!texts.includes(key)){
      texts.push(key)
      resolver.texts = texts
      resolver.save()
    }
  }

  let resolverEvent = new TextChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.key = event.params.key
  resolverEvent.save()
}

export function handleContentHashChanged(event: ContenthashChangedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)
  resolver.contentHash = event.params.hash
  resolver.save()
  
  let resolverEvent = new ContenthashChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.hash = event.params.hash
  resolverEvent.save()
}

export function handleInterfaceChanged(event: InterfaceChangedEvent): void {
  let resolverEvent = new InterfaceChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.interfaceID = event.params.interfaceID
  resolverEvent.implementer = event.params.implementer
  resolverEvent.save()
}

export function handleAuthorisationChanged(event: AuthorisationChangedEvent): void {
  let resolverEvent = new AuthorisationChanged(createEventID(event))
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.owner = event.params.owner
  resolverEvent.target = event.params.target
  resolverEvent.isAuthorized = event.params.isAuthorised
  resolverEvent.save()
}

function getOrCreateResolver(node: Bytes, address: Address): Resolver {
  let id = createResolverID(node, address)
  let resolver = Resolver.load(id)
  if(resolver === null) {
    resolver = new Resolver(id)
    resolver.domain = node.toHexString()
    resolver.address = address
  }
  return resolver as Resolver
}

function createEventID(event: ethereum.Event): string {
  return event.block.number.toString().concat('-').concat(event.logIndex.toString())
}

function createResolverID(node: Bytes, resolver: Address): string {
  return resolver.toHexString().concat('-').concat(node.toHexString())
}
