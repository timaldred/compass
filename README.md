# Compass

## An app which returns the distance and direction between two points on a map

My cousin Robin (who walks/hikes a lot) says one thing he'd like to see is the distance and direction to any given point on a map.

With this information, he'd be able to use his compass as a guide when walking.

So I made it.

[You can see it live, here](https://timaldred.com/compass)

Here's some cool things it uses:

## 🧭 Google maps API
I've used APIs in projects before, but this was my first using Google Maps. And it's pretty cool!

I wanted to use Google because it has extraordinarily detailed maps of the whole world. And it's free.

But once I'd opened it up, I found that it had built-in markers, distance calculation and bearing calculation!

## 🧭 User location
The first iteration of this app required the user to search for their location, which seemed like a chore and not great UX.

So while there's still a search function, the user also has the option of automatically finding their location (if they give permission, of course)

## 🧭 'if' functions
I coded in a piece where if Point A hasn't been logged yet, it asks the user to choose a starting place. And if there's a starting place but no ending point, the message changes and asks for that.

And then when there are two points and a calculation has been made, it removes the instructions and prints the results.

## 🧭 Mobile formatting
The results are shown on one line on desktop, but neatly broken into two on mobile.

This is because I recently learned how to write different pieces of code for different screen sizes and I like doing it.