<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('first_name')->nullable()->after('id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('preferred_name')->nullable()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->string('timezone')->default('UTC')->after('phone');
            $table->string('preferred_locale', 8)->default('en')->after('timezone');
            $table->string('role')->default('teacher')->after('preferred_locale');
            $table->boolean('is_active')->default(true)->after('role');
            $table->timestamp('last_login_at')->nullable()->after('email_verified_at');
            $table->timestamp('invited_at')->nullable()->after('last_login_at');
            $table->timestamp('activated_at')->nullable()->after('invited_at');
            $table->timestamp('deactivated_at')->nullable()->after('activated_at');
            $table->timestamp('password_updated_at')->nullable()->after('deactivated_at');
            $table->unsignedBigInteger('organization_id')->nullable()->after('password');
            $table->json('permissions')->nullable()->after('organization_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'first_name',
                'last_name',
                'preferred_name',
                'phone',
                'timezone',
                'preferred_locale',
                'role',
                'is_active',
                'last_login_at',
                'invited_at',
                'activated_at',
                'deactivated_at',
                'password_updated_at',
                'organization_id',
                'permissions',
            ]);
        });
    }
};

