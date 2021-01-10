// version January 2019
// written by Jeremy Zehr & Ava Creemers
// based on earlier versions by Robert Wilder, Amy Goodwin Davies, Akiva Bacovcin and Jeremy Zehr

PennController.ResetPrefix(null);

// Preload the ZIP files (will start with the top one, so give practice items first)
PennController.PreloadZip("https://www.ling.upenn.edu/~liaini/Soundfiles/Practice.zip")
PennController.PreloadZip("https://www.ling.upenn.edu/~liaini/Soundfiles/Exp2.zip")

// Sequence of trials, based on their labels
PennController.Sequence( "consentform" , "playfile" , "instructions" , randomize("practice") , "start" , "preload" ,
                         randomize("ExpBlock1") , "break" , randomize("ExpBlock2") , "break" , randomize("ExpBlock3") , "Questionaire", "send" , "final" )
                          // Notice "send" before "final" --- refers to SendResults below
                          // Adjust amount of blocks + breaks in the sequence 
    
PennController.DebugOff()    // Uncomment when ready to publish
noTopMargin = ()=>newFunction( ()=> $(".PennController-PennController").css("margin-top", "-1em") ).call()



// Start with the consent form
PennController( "consentform" ,
    newHtml("consentform.html")
      .print()
    ,
    newButton("我同意参加。")
        .print()
        .wait()
)
.log( "ID" , PennController.GetURLParameter("id") )     // This will add the ID at the end of the results line
.setOption("hideProgressBar", true)                     // We don't show the progress bar for this trial


// Check that participants are able to play a "test" audio file    
PennController( "playfile" ,
    newHtml("playfile.html")
      .print()
    ,
    newButton("我能够播放该音频文件。")
        .print()
        .wait()
)
.log( "ID" , PennController.GetURLParameter("id") )     
.setOption("hideProgressBar", true) 


// Give instructions
PennController( "instructions" ,
    newHtml("instructions.html")
      .print()
    ,
    newButton("我已阅读完实验要求。")
        .print()
        .wait()
)
.log( "ID" , PennController.GetURLParameter("id") )     
.setOption("hideProgressBar", true) 



// --- PRACTICE ITEMS ---      
// This generates trials using the file Practiceitems.csv from chunk_includes
PennController.Template( "PracticeItems.csv" , 
    row => PennController( "practice" ,     // all these trials will be labeled 'practice' (see Sequence above)
        newTimer(400-200*Math.random())    // This gives you a random ISI (here shorter for practice items since feedback stays for 900)
            .start()
            .wait()
        ,
        newText("F", "F: 假词")          // We create the Text elements in cache (not printed yet)
          .settings.bold()
        ,
        newText("J", "J: 真词")
          .settings.bold()
        ,
        newCanvas("text", 480, 40)    // 
            .settings.center()
            .settings.add( 0 , 0 ,  getText("F") )
            .settings.add( 410 , 0 ,  getText("J") )    // aligned to the right edge
            .print()                                    // Prints the Canvas along with its Text elements
        ,
        newAudio("Prime", row.PrimeSoundFile)
            .settings.log("play","end")     // Logging when it starts and ends playing
            .play()
        ,
        newKey("answerPrime", "FJ")  // Respond by pressing F or J key 
            .settings.log("all")
            .wait()
            .setVar("keyPressedprime")
            .settings.disable()
        ,
        newVar("keyPressedprime", "None")       
            .settings.global()
            .set( getKey("answerPrime") )  // This logs what the answer was 
        ,
        getAudio("Prime")                   // The key has been pressed (cf 'wait' on newKey above)
            .wait("first")                  // Now wait until audio has ended *if has not ended yet*
        ,
        getCanvas("text")
            .remove()
        ,
        newText("feedbackPrime", row.Pword) // this prints whether the prime was a word or non-word
          .settings.bold()
          .settings.center()
          .settings.color("blue")
          .print()
        ,
        newTimer(1000-200*Math.random())
            .start()
            .wait()
        ,
        getText("feedbackPrime")
          .remove()
        ,
        getCanvas("text")
            .print()
        ,
        newAudio("Target", row.TargetSoundFile)
            .settings.log("play","end")
            .play()
        ,
        newKey("answerTarget", "FJ")  // Respond by pressing F or J key 
            .settings.log("all")
            .wait()
            .setVar("keyPressedtarget")
            .settings.disable()
        ,
        newVar("keyPressedtarget", "None")       
            .settings.global()
            .set( getKey("answerTarget") )  // This logs what the answer was 
        ,
        getAudio("Target")
            .wait("first")
        ,
        getCanvas("text")
          .remove()
        ,
        newText("feedbackTarget", row.Tword)
          .settings.bold()
          .settings.center()    
          .settings.color("blue")
          .print()
        ,
        newTimer(900)
          .start()
          .wait()
    )
    .log("ID" , PennController.GetURLParameter("id") )
    .log("PrimeSoundfile"  , row.PrimeSoundFile  )
    .log("TargetSoundfile" , row.TargetSoundFile )
    .log("KeyPrime" , getVar("keyPressedprime") )   // key press prime  
    .log("KeyTarget" , getVar("keyPressedtarget") )  // key press target    
)

PennController( "start" ,
    newHtml("start.html")
      .print()
    ,
    newButton("开始实验")
        .print()
        .wait()
)
.setOption("hideProgressBar", true) 
    
// This creates a trial (labeled "preload"---see Sequence above) that only moves on when all the resources 
// (ie all the audio files) used by the trials labeled ExpBlock1, etc. have been preloaded 
PennController.CheckPreloaded( "ExpBlock1" , "ExpBlock2", "ExpBlock3" ).label("preload")



// --- EXPERIMENTAL ITEMS ---      
// This generates trials using the file Expitems.csv from chunk_includes
PennController.Template( "ExpItems.csv" , 
    row => PennController( row.BlockNum ,           // These trials will be labeled from the BlockNum column; starting with the first block.
        newVar("ITI", 0)                // This will store the ITI 
          .settings.global()            // Global so we can use it inside log below
          .set( v => Date.now() )       
        ,
        newTimer(1000-200*Math.random())
            .start()
            .wait()
        ,
        getVar("ITI")                   // After newTimer 
          .set( v => Date.now() - v )   // Set it to current timestamp - previous timestamp (v)
        ,
        newText("F", "F: 假词")
          .settings.bold()
        ,
        newText("J", "J: 真词")
          .settings.bold()
        ,
        newCanvas("text", 480, 40)    // 
            .settings.center()
            .settings.add( 0 , 0 ,  getText("F") )
            .settings.add( 410 , 0 ,  getText("J") )    // aligned to the right edge
            .print()                        // Prints the Canvas along with its Text elements
        , 
        newVar("primeRT", 0)                // This will store the RT for the prime
          .settings.global()                // Global so we can use it inside log below
          .set( v => Date.now() )           // Set it to the timestamp immediately before audio.play
        ,
        newAudio("Prime", row.PrimeSoundFile)
            .settings.log("play","end")
            .play()
        ,     
        newKey("answerPrime", "FJ")  // Respond by pressing F or J key 
            .settings.log("all")
            .wait()
            .setVar("keyPressedprime")
            .settings.disable()
        ,
        newVar("keyPressedprime", "None")       
            .settings.global()
            .set( getKey("answerPrime") )  // This logs what the answer given was 
        ,
        getVar("primeRT")                   // The key has been pressed (cf wait on newKey above)
          .set( v => Date.now() - v )       // Set it to current timestamp - previous timestamp (v)
        ,
        getAudio("Prime")
            .wait("first")
        ,
        getCanvas("text")
            .remove()
        ,
        newVar("ISI", 0)                // This will store the ISI = time between prime and target 
            .settings.global()            // Global so we can use it inside log below
            .set( v => Date.now() )       
        ,    
        newTimer(1000-200*Math.random())
            .start()
            .wait()
        ,
        getVar("ISI")                   // After newTimer 
          .set( v => Date.now() - v )   // Set it to current timestamp - previous timestamp (v)
        ,    
        getCanvas("text")
            .print()
        ,
        newVar("targetRT", 0)               // Same as above, but for target this time
          .settings.global()
          .set( v => Date.now() )
        ,
        newAudio("target", row.TargetSoundFile)
            .settings.log("play","end")
            .play()
        ,       
        newKey("answerTarget", "FJ")  // Respond by pressing F or J key 
            .settings.log("all")
            .wait()
            .setVar("keyPressedtarget")
            .settings.disable()
        ,
        newVar("keyPressedtarget", "None")       
            .settings.global()
            .set( getKey("answerTarget") )  // This logs what the answer was 
        ,
        getVar("targetRT")
            .set( v => Date.now() - v )
        ,
        getAudio("target")
            .wait("first")
        ,
        getCanvas("text")
            .remove()
    )
    .log("ID" , PennController.GetURLParameter("id") )
    .log("PrimeSoundfile"  , row.PrimeSoundFile  )
    .log("TargetSoundfile" , row.TargetSoundFile )
    .log("primeRT" , getVar("primeRT") )           // Will append the values of primeRT and
    .log("targetRT" , getVar("targetRT") )         // targetRT to all of the trial's results lines 
    .log("ITI" , getVar("ITI") )                   // ITI
    .log("ISI" , getVar("ISI") )                   // ISI 
    .log("KeyPrime" , getVar("keyPressedprime") )   // gives the key press prime  
    .log("KeyTarget" , getVar("keyPressedtarget") )  // gives the key press target
    .log("RowNum"  , row.RowNum )
    .log("BlockNum" , row.BlockNum )
    .log("ItemIdent" , row.ItemNum )
    .log("Condition" , row.Condition )
    .log("Group" , row.Group )
    .log("prime" , row.Prime )
    .log("target" , row.Target )
    .log("pword" , row.Pword )
    .log("tword" , row.Tword )
    .log("ptype" , row.Ptype )
    .log("ttype" , row.Ttype )
)


// This creates a trial labeled "break"; we show it in between the blocks.
PennController( "break" ,
      newText("现在您可稍作休息。")
        .settings.bold()
        .print()
      ,
      newButton("请继续实验！")
        .print()
        .wait()
)

// Questionaire at end
PennController( "Questionaire" ,
    newHtml("questionaire.html")
      .print()
      .settings.log() // this logs the answers in the htlm file 
    ,
    newButton("提交结果！")
        .print()
        .wait()
)
.log( "ID" , PennController.GetURLParameter("id") )     
.setOption("hideProgressBar", true)                     // We don't show the progress bar for this trial

    
// This is necessary to send the results *before* showing the final (everlasting) screen
PennController.SendResults("send")

// This creates the final screen
PennController( "final" , 
    newHtml("final.html")
      .print()
    ,
    newTimer(1)
        .wait()                 // This will wait forever, because the Timer was never started
)
.setOption("countsForProgressBar", false)


