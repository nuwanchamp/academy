<?php

test('register route is accessible', function () {
    $this->get('/register')->assertOk();

    expect(route('register'))->toEqual(url('/register'));
});
