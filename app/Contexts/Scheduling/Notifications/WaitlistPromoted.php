<?php

namespace App\Contexts\Scheduling\Notifications;

use App\Contexts\Scheduling\Models\StudySession;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WaitlistPromoted extends Notification
{
    use Queueable;

    public function __construct(private readonly StudySession $session)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('You have been moved off the waitlist')
            ->line('You are now enrolled in '.$this->session->title)
            ->line('Starts: '.$this->session->starts_at->toDateTimeString());
    }
}
