<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Messenger\MessageBusInterface;
use App\Message\TelegramWebhookReceived;

class WebhookController extends Controller
{
    public function handle(Request $request, MessageBusInterface $bus)
    {
        // Example: Laravel Octane API Gateway
        // 1. Fast validation
        $data = $request->validate([
            'message.chat.id' => 'required|integer',
            'message.text' => 'required|string',
        ]);

        // 2. Publish to RabbitMQ via Symfony Messenger immediately
        $bus->dispatch(new TelegramWebhookReceived(
            $data['message']['chat']['id'],
            $data['message']['text']
        ));

        // 3. Return 200 OK to Telegram (< 50ms latency)
        return response()->json(['status' => 'queued']);
    }
}
