# AI Controller Guide

This project uses `NPCAIController` for NPC ship movement.

## What The AI Is Trying To Do

It tries to do three things every frame:

1. Decide how fast it should be moving toward the target right now.
2. Decide which way the ship should face to achieve that movement.
3. Convert that decision into left and right engine throttle values.

## What Information The AI Uses

The controller uses:

- ship position
- ship velocity
- ship acceleration
- ship rotation and angular velocity
- ship heading
- ship mass
- hull and fuel state
- engine throttle/output limits
- engine geometry
- target position
- optional target velocity

This matters because the AI needs to know not only where the ship is, but also what the ship is physically capable of doing.

## High-Level Flow

Each update works roughly like this:

### 1. Measure The Situation

The AI looks at:

- where the ship is
- where the target is
- how far away the target is
- how fast the ship is already moving
- how quickly the ship can speed up, slow down, and turn

### 2. Pick A Reasonable Approach Speed

If the target is far away, the AI allows a faster approach.

If the target is close, the AI reduces the allowed closing speed so it still has enough room to slow down.

That is the core idea that prevents most overshooting.

### 3. Compute A Desired Movement Direction

The AI compares the current ship velocity with the desired velocity.

From that it decides what acceleration it wants next. In plain terms: "I want to be moving more like this, so I should push in that direction."

### 4. Turn The Ship Toward That Direction

The ship cannot thrust sideways. It must rotate first.

So the controller computes a desired heading and then uses the engines to turn toward it.

### 5. Apply Throttle Carefully

The AI only applies strong forward thrust when the ship is facing close enough to the desired direction.

If the angle is poor, it prioritizes turning first.

This is important because trying to thrust hard while badly misaligned usually makes the trajectory worse.

## Why It Usually Feels Better

The controller is more stable because it thinks in terms of controlled arrival.

In practice, that means:

- less wild overshoot
- less useless spinning
- better braking near the target
- more predictable pursuit behavior

It is still a game AI, not a perfect pilot. That is intentional. You can tune it toward "smarter" or toward "more beatable."

## Tuning Overview

Each level can provide its own AI tuning values in `level.yaml`.

Current tuning fields are:

- `AI_ARRIVE_RADIUS`
- `AI_ARRIVE_SPEED`
- `AI_MAX_CLOSING_SPEED`
- `AI_POSITION_GAIN`
- `AI_VELOCITY_GAIN`
- `AI_STOP_VELOCITY_GAIN`
- `AI_MAX_POSITION_ACCELERATION`
- `AI_HEADING_GAIN`
- `AI_ANGULAR_DAMPING`
- `AI_MAX_THRUST_ANGLE_DEG`
- `AI_ALIGNMENT_EXPONENT`
- `AI_TURN_THROTTLE_PENALTY`

You do not usually need to change all of them. Start with the few that match the problem you see.

## What Each Setting Does

### `AI_ARRIVE_RADIUS`

How close the AI considers "good enough" to the target.

Higher value:

- AI is less precise
- AI starts behaving as if it has arrived sooner
- usually easier and less twitchy

Lower value:

- AI tries to be more exact
- can look smarter
- can also become more nervous near the target

Good first adjustment when the AI looks too fussy around pickups.

### `AI_ARRIVE_SPEED`

This is the intended speed near arrival.

At the moment this value is part of the target shape and is useful as a design knob, even if most of the visible behavior is driven more by the braking and velocity settings below.

Higher value:

- AI accepts a faster arrival
- more aggressive fly-bys

Lower value:

- AI tries to settle more gently

### `AI_MAX_CLOSING_SPEED`

Hard cap on how fast the AI is allowed to approach the target.

Higher value:

- more aggressive
- reaches targets faster
- easier to overshoot if other values are also aggressive

Lower value:

- safer
- easier to beat
- more deliberate movement

This is one of the best "difficulty" knobs.

### `AI_POSITION_GAIN`

How strongly the AI reacts to being far from the target.

Higher value:

- stronger push toward the target
- more urgency
- can look overeager

Lower value:

- softer pursuit
- smoother, but can feel lazy

### `AI_VELOCITY_GAIN`

How strongly the AI tries to correct the difference between its current velocity and its desired velocity.

Higher value:

- snappier motion correction
- more responsive
- can become more twitchy

Lower value:

- calmer motion
- may drift too much or react late

This is usually the main "how responsive does it feel" control.

### `AI_STOP_VELOCITY_GAIN`

How aggressively the AI kills off velocity once it is in arrival range.

Higher value:

- harder braking near the target
- better stopping
- can lead to more rapid correction reversals

Lower value:

- softer settling
- more glide and drift near the goal

### `AI_MAX_POSITION_ACCELERATION`

Upper limit on how much of the position-based push is allowed.

Higher value:

- stronger chase drive
- more assertive line toward target

Lower value:

- tamer movement
- less sudden aggression when far away

Useful when the AI feels too dominant over long distances.

### `AI_HEADING_GAIN`

How aggressively the AI tries to turn toward its desired heading.

Higher value:

- faster turning response
- more decisive nose alignment
- can cause oscillation or "wobble" if too high

Lower value:

- smoother turning
- may feel sluggish or indecisive

If the ship keeps weaving left and right, this value may be too high.

### `AI_ANGULAR_DAMPING`

How much the AI resists its own spin.

Higher value:

- stronger anti-spin behavior
- less overshoot in rotation
- can feel heavy or reluctant to turn

Lower value:

- livelier turning
- more risk of oscillation and over-rotation

If the ship snaps past the correct heading and keeps correcting back and forth, increase this.

### `AI_MAX_THRUST_ANGLE_DEG`

Maximum angle error where the AI still allows meaningful forward thrust.

Higher value:

- AI will keep thrusting even while somewhat misaligned
- more aggressive, less disciplined

Lower value:

- AI turns first, then thrusts
- cleaner trajectories
- can feel slower

This is one of the best knobs for reducing sloppy movement.

### `AI_ALIGNMENT_EXPONENT`

How strongly the AI penalizes forward thrust when it is not lined up well.

Higher value:

- thrust drops off harder when misaligned
- more disciplined steering

Lower value:

- AI keeps more thrust while turning
- more aggressive, but can smear sideways through turns

### `AI_TURN_THROTTLE_PENALTY`

How much turning effort suppresses forward thrust.

Higher value:

- turn-first behavior
- cleaner course correction
- less raw speed during steering

Lower value:

- more simultaneous thrust and turning
- faster pursuit
- can be messier and harder to control

This is another very useful difficulty knob.

## Practical Tuning Strategy

Do not tune everything at once.

Use this order:

1. Set overall aggression with `AI_MAX_CLOSING_SPEED`.
2. Set arrival behavior with `AI_ARRIVE_RADIUS` and `AI_STOP_VELOCITY_GAIN`.
3. Set turn behavior with `AI_HEADING_GAIN` and `AI_ANGULAR_DAMPING`.
4. Clean up sloppy thrusting with `AI_MAX_THRUST_ANGLE_DEG`, `AI_ALIGNMENT_EXPONENT`, and `AI_TURN_THROTTLE_PENALTY`.
5. Fine-tune chase strength with `AI_POSITION_GAIN`, `AI_VELOCITY_GAIN`, and `AI_MAX_POSITION_ACCELERATION`.

That order tends to be much easier than randomly adjusting values.

## Symptom-Based Tuning

### Problem: The AI overshoots the target too often

Try:

- lower `AI_MAX_CLOSING_SPEED`
- raise `AI_STOP_VELOCITY_GAIN`
- raise `AI_ARRIVE_RADIUS`
- lower `AI_MAX_THRUST_ANGLE_DEG`
- raise `AI_TURN_THROTTLE_PENALTY`

### Problem: The AI feels unbeatable

Try:

- lower `AI_MAX_CLOSING_SPEED`
- lower `AI_POSITION_GAIN`
- lower `AI_VELOCITY_GAIN`
- lower `AI_MAX_POSITION_ACCELERATION`
- raise `AI_ARRIVE_RADIUS`

### Problem: The AI feels too slow or dumb

Try:

- raise `AI_MAX_CLOSING_SPEED`
- raise `AI_POSITION_GAIN`
- raise `AI_VELOCITY_GAIN`
- lower `AI_TURN_THROTTLE_PENALTY`

### Problem: The AI wobbles while turning

Try:

- lower `AI_HEADING_GAIN`
- raise `AI_ANGULAR_DAMPING`

### Problem: The AI keeps thrusting while pointed the wrong way

Try:

- lower `AI_MAX_THRUST_ANGLE_DEG`
- raise `AI_ALIGNMENT_EXPONENT`
- raise `AI_TURN_THROTTLE_PENALTY`

### Problem: The AI stalls and seems too cautious

Try:

- raise `AI_MAX_THRUST_ANGLE_DEG`
- lower `AI_TURN_THROTTLE_PENALTY`
- lower `AI_ALIGNMENT_EXPONENT`

## Using Debug Mode To Tune

When debug mode is enabled, the game can show live AI values such as:

- distance to target
- closing speed limit
- angle error
- forward throttle
- turn command
- desired velocity
- desired acceleration
- relative position
- relative velocity

This is the fastest way to tune the AI.

Examples:

- If `angle error` stays large while `forward throttle` is still high, the AI is probably allowed to thrust too much while misaligned.
- If `turn command` keeps flipping between strong left and strong right, turn tuning is probably too aggressive.
- If `closing speed limit` is high and the AI still blows past targets, lower `AI_MAX_CLOSING_SPEED` or raise braking-related tuning.

## Recommended Mindset

Treat the AI as a character, not as a perfect autopilot.

For competitive levels, the best result is usually not "most optimal." It is usually:

- believable
- readable
- strong enough to be interesting
- weak enough to be fair

That means you should tune for behavior, not just efficiency.

## Files To Look At

- `src/Levels/NPCAIController.ts`: controller implementation
- `src/Levels/FuelRush/index.ts`: level-specific controller setup
- `src/Levels/FuelRush/level.yaml`: example of level-based tuning values
- `src/Levels/GameOfTag/index.ts`: another example of controller usage
- `src/Levels/GameOfTag/level.yaml`: another tuning profile
- `src/debug.ts`: debug overlay for live AI values

## Short Version

If you only remember five things:

1. `AI_MAX_CLOSING_SPEED` controls overall aggression.
2. `AI_ARRIVE_RADIUS` and `AI_STOP_VELOCITY_GAIN` control how cleanly it settles near a target.
3. `AI_HEADING_GAIN` and `AI_ANGULAR_DAMPING` control turn quality.
4. `AI_MAX_THRUST_ANGLE_DEG` and `AI_TURN_THROTTLE_PENALTY` control whether it turns first or thrusts while turning.
5. Use debug mode and tune one problem at a time.