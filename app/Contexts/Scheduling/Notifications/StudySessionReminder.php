<?php

namespace App\Contexts\Scheduling\Notifications;

use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionOccurrence;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudySessionReminder extends Notification
{
    use Queueable;

    public function __construct(
        private readonly StudySession $session,
        private readonly StudySessionOccurrence $occurrence
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $location = $this->session->meeting_url ?? $this->session->location ?? 'Online';

        return (new MailMessage())
            ->subject('Reminder: '.$this->session->title)
            ->line('Starts: '.$this->occurrence->starts_at->toDateTimeString())
            ->line('Location: '.$location)
            ->action('Join session', $this->session->meeting_url ?? '#');
    }
}
