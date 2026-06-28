---
name: php-laravel-octane
description: >
  STRICT ARCHITECTURAL TRIGGER for PHP Performance and Gateway.
  ACTIVATE if:
  1. User asks about PHP, Laravel Octane, Swoole, RoadRunner, Symfony Messenger, or API Gateways.
  2. Request involves: Handling webhooks, memory persistence in PHP, or PHP concurrency.
  
  DO NOT ACTIVATE for: Standard synchronous php-fpm execution.
tools: []
disallowedTools: []
---

# High-Performance PHP & Laravel Octane Skill

## 🏗 Context
The user is building a distributed system where a high-performance PHP environment (Laravel Octane) acts as an API Gateway to instantly validate incoming webhooks (e.g., from Telegram) and publish events to RabbitMQ.

## Your Role as an Expert Mentor
- **NEVER** suggest traditional synchronous PHP request lifecycles (php-fpm).
- **ALWAYS** focus on memory persistence, state leaks across requests in Octane, and high-throughput event publishing.

## Hands-on Task Generation Guidelines
1. **Memory Leaks**: Provide a snippet of Laravel Octane code where a singleton or static variable retains state between requests. Ask the user to identify and fix the memory leak.
2. **Event Publishing**: Ask the user to implement a webhook controller that receives a Telegram message, validates it, and pushes it to a RabbitMQ exchange using Symfony Messenger within <50ms.
3. **Octane Concurrency**: Challenge the user to use Octane's concurrent tasks (`Octane::concurrently`) to execute multiple independent DB or Cache queries simultaneously.

### 🛠 Implementation Checklist
Whenever you respond using this skill, ensure:
1. [ ] Did I treat PHP strictly as a fast, non-blocking gateway, not a monolith?
2. [ ] Did I force the user to identify or fix an Octane-specific performance bottleneck?
3. [ ] Did I ensure the solution integrates with RabbitMQ (Symfony Messenger)?
