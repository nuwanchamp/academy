<?php

namespace App\Contexts\Scheduling\Notifications;

use App\Contexts\Scheduling\Models\StudySession;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudySessionUpdated extends Notification
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
            ->subject('Study session updated: '.$this->session->title)
            ->line('A study session has been updated.')
            ->line('Starts: '.$this->session->starts_at->toDateTimeString())
            ->line('Ends: '.$this->session->ends_at->toDateTimeString());
    }
}
