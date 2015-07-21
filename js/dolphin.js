// the functions associated with preload, create and update.
var actions = { preload: preload, create: create, update: update };
// the Game object used by the phaser.io library
var width = 700;
var height = 400;
var game = new Phaser.Game(width, height, Phaser.AUTO, "game", actions);
// Global score variable initialised to 0.
var score = 0;
// Global variable to hold the text displaying the score.
var labelScore;
// Global player variable declared but not initialised.
var player;
// Global pipes variable initialised to the empty array.
var pipes = [];
// the interval (in seconds) at which new pipe columns are spawned
var gameGravity = 450;
var gameSpeed = 200;
var jumpPower = 200;
var pipeInterval = 1.75;
var pipeGap = 100;
var balloons = [];
var weights = [];
var pipeWidth=50;

// Loads all resources for the game and gives them names.
function preload() {
    // make image file available to game and associate with alias playerImg
    game.load.image("playerImg", "../assets/dolphin.png");
    // make sound file available to game and associate with alias score
    game.load.audio("score", "../assets/point.ogg");
    // make image file available to game and associate with alias pipe
    game.load.image("pipe","../assets/column.png");
    game.load.image("pipeEnd","../assets/pipe2-end.png");
    // make image file available to game and associate with alias BG (background)
    game.load.image("background","../assets/SEA.png");
    game.load.image("balloons","../assets/seaweed.png");
    game.load.image("weight","../assets/weight.png");
    game.load.image("star","..assets/star.png")
}

// Initialises the game. This function is only called once.
function create() {
    // set the background colour of the scene
    game.stage.setBackgroundColor("#F3D3A3");
    game.add.sprite(0,0, "background");
    // add score text
    labelScore = game.add.text(20, 20, "0",
        {font: "30px Arial", fill: "#000000"});
    // initialise the player and associate it with playerImg
    player = game.add.sprite(80, 200, "playerImg");
    player.scale.setTo(0.1, 0.1);
    player.anchor.setTo(0.5, 0.5);
    // Start the ARCADE physics engine.
    // ARCADE is the most basic physics engine in Phaser.
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // enable physics for the player sprite
    game.physics.arcade.enable(player);

    game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(start);
}

function start() {
    // set the player's gravity
    player.body.gravity.y = gameGravity;
    // associate spacebar with jump function
    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(playerJump);
    // time loop for game to update
    game.time.events.loop(pipeInterval * Phaser.Timer.SECOND, generate);
}

// This function updates the scene. It is called for every new frame.
function update() {
    game.physics.arcade.overlap(player, pipes, gameOver);
    if(0 > player.body.y || player.body.y > height){
        gameOver();
    }

    player.rotation = Math.atan(player.body.velocity.y / gameSpeed);

    // Check if the player gets a bonus
    checkBonus(balloons, -50);
    checkBonus(weights, 50);
    // Clean the pipe array
    for(var i=pipes.length - 1; i >= 0; i--) {
        if(pipes[i].body.x - pipeWidth < 0){
            pipes[i].destroy;
            changeScore()
            pipes.splice(i,1);
        }
    }
    // Call gameOver function when player overlaps with pipe
    // (i.e. when player hits a pipe)
    game.physics.arcade.overlap(player, pipes, gameOver);
}

function checkBonus(bonusArray, bonusEffect) {
    // Step backwards in the array to avoid index errors from splice
    for(var i=bonusArray.length - 1; i>=0; i--){
        game.physics.arcade.overlap(player,bonusArray[i], function(){
            // destroy sprite
            bonusArray[i].destroy();
            // remove element from array
            bonusArray.splice(i,1);
            // apply the bonus effect
            changeGravity(bonusEffect);
            score = score + 1;
            labelScore.setText(score.toString());
        });
    }
}

// Adds a pipe part to the pipes array
function addPipeBlock(x, y) {
    // make a new pipe block
    var block = game.add.sprite(x, y, "pipe");
    // insert it in the pipe array
    pipes.push(block);
    // enable physics engine for the block
    game.physics.arcade.enable(block);
    // set the block's horizontal velocity to a negative value
    // (negative x value for velocity means movement will be towards left)
    block.body.velocity.x = -200;
}

function addPipeEnd(x, y) {
    var block = game.add.sprite(x, y, "pipeEnd");
    pipes.push(block);
    game.physics.arcade.enable(block);
    block.body.velocity.x = -gameSpeed;
}

function generate(){
    var diceRoll = game.rnd.integerInRange(1, 10);
    if(diceRoll==1){
        generateBalloons();
    } else if(diceRoll==2){
        generateWeight();
    } else {
        generatePipe();
    }
}

function generatePipe() {
    var gapStart = game.rnd.integerInRange(50, height - 50 - pipeGap);

    addPipeEnd(width-2,gapStart - 25);
    for(var y=gapStart - 75; y>-50; y -= 50){
        addPipeBlock(width,y);
    }

    addPipeEnd(width-2,gapStart+pipeGap+13);
    for(var y=gapStart + pipeGap + 25; y<height; y += 50){
        addPipeBlock(width,y);
    }
}

function generateBalloons(){
    var bonus = game.add.sprite(width, height, "balloons");
    balloons.push(bonus);
    game.physics.arcade.enable(bonus);
    bonus.body.velocity.x = -gameSpeed;
    bonus.body.velocity.y = -game.rnd.integerInRange(60,100);
}

function generateWeight(){
    var bonus = game.add.sprite(width, 0, "weight");
    weights.push(bonus);
    game.physics.arcade.enable(bonus);
    bonus.body.velocity.x = -gameSpeed;
    bonus.body.velocity.y = game.rnd.integerInRange(60,100);
}

function changeGravity(g){
    gameGravity += g;
    player.body.gravity.y = gameGravity;
}

function playerJump() {
    player.body.velocity.y = - jumpPower;
}

function changeScore() {
    score = score + 0.125;
    labelScore.setText(score.toString());
    if (score%1 != 0) {
        Math.round(score);
    }
}
function gameOver() {
    score = 0;
    gameGravity = 450;
    game.state.restart();
}

function start() {
    // set the player's gravity
    player.body.gravity.y = gameGravity;
    // associate spacebar with jump function
    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(playerJump);
    // time loop for game to update
    game.time.events.loop(pipeInterval * Phaser.Timer.SECOND, generate);
}