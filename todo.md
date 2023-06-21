https://github.com/bitbot-irc/bitbot/tree/master/modules is a great source for ideas

[X] option to turn off pinging on response
[X] must persist
[X] per channel ops
[] hyperscript language: a simple scripting language for writing scripts for hyperbot that can be written and ran by everybody
[] improved cli
[] tcoin system
[] revenue generation through &tilde game
[] connect to ~chat too (no integration between them though)
[X] on tilde.town irc, authenticate using the user in hostname
[X] instead of cmd.fail and cmd.assert, running commands should be in a try-catch and commands throw errors instead of using cmd.fail. the fail message should be the same
[X] last online command
[] map package ids to package data instead of showing package data (problematic)
[] something likes ducks for tilde.town irc
[] leaderboard for it (shows top 10)
[] polls
[X] reminders to remind users (arguments: text, duration)
[] statistics
[] maybe a leveling system
[] wikipedia api
[] some kind of weather api?
[] translation api
[] todo lists for users
[] badges for chatting, special things
[] logging errors and warnings
[] tools for operators to help in moderation
[] far-future: coin system
[] suggestion utility
[X] dice
[X] 8ball
[] lua running using (https://www.lua.org/cgi-bin/demo) check out (https://github.com/bitbot-irc/bitbot/blob/master/modules/eval_lua.py)
[] maybe show title of urls posted in chat
[X] rust evaluation (check out https://github.com/bitbot-irc/bitbot/blob/master/modules/rust.py)
[] autoban for spam tool when bot oped (see https://github.com/bitbot-irc/bitbot/blob/master/modules/highlight_spam.py)
[] tell command (https://github.com/bitbot-irc/bitbot/blob/master/modules/tell.py)
[] op may choose to greet users to the channel (https://github.com/bitbot-irc/bitbot/blob/master/modules/greeting.py)
[] python eval
[] some kind of integration with ~chat
[] fix web

<jmjl> hyper: you could even set file permissions so a user can create their own submission in the folder
<jmjl> (or you could make a setuid executable that would save a copy of their submission, with a random id the same way you generate it)

<jmjl> hyper: I got a weird idea but dunno if it should be implemented
<hyper> well, theyre not close to being done but for now theres the pipe command, say command
<hyper> huh?
<jmjl> hyper: making a action let you run another command (be it integrated or from another package), letting the creator specify the params
<hyper> ah, i was thinking of that too
<jmjl> hyper: how would I get a parameter to a command from a package?
<hyper> uhh
<hyper> you could probably do something like $!remotecall,<module-name>,<command-name>,<arg-string>
<jmjl> oh, that's true, what would the function return?
<hyper> depends on the command
<hyper> for example if the command does something, like op, it wont return anything
<jmjl> hyper: would you make another action to not print the output to anywhere (so you could call multiple functions without saying a reply)?
<hyper> i was thinking of that too
<jmjl> hyper: I got a weird idea
<hyper> so basically i can call the function with a different, "virtual" api
<hyper> so when it calls cmd.respond it just adds to a string that is the result
<jmjl> what if you make every $!command be a action type
<hyper> wdym?
<jmjl> that way remotecall could be run on it's own
<hyper> well, you can do that
<jmjl> every action that you create would automatically be a $!command, and the same applies the other way
<hyper> maybe i can make a void command that just runs another command but throws away its value not returning it
<hyper> so for example
<hyper> $!void,cmd,args
<jmjl> then you'd have say,do,no-op,remotecall
<jmjl> hyper: that'd be possible
<hyper> both seems good
