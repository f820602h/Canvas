let colorBar = $('.colorBar')
let canvas = document.querySelector('#draw')
let ctx = canvas.getContext('2d')
let canvasWidth = $('body').outerWidth(true)
let canvasHeight = $('body').outerHeight(true)
let eraser = false
let backgroundColor = '#e8e8e8'
let brushColor = ['#ffffff', '#000000', '#9BFFCD', '#00CC99', '#01936F']
let lastPointX
let lastPointY
let step = -1
let history = []

let push = function() {
	step++
	if (step <= history.length - 1) history.length = step
	history.push(canvas.toDataURL())
	if (step > 0) {
		$('#undo').removeClass('disable')
	}
	if (step < history.length - 1) {
		$('#redo').removeClass('disable')
	} else {
		$('#redo').addClass('disable')
	}
}
let undo = function() {
	let lastDraw = new Image()
	if (step > 0) step--
	lastDraw.src = history[step]
	lastDraw.onload = function() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight)
		ctx.drawImage(lastDraw, 0, 0)
	}
	if (step == 0) {
		$('#undo').addClass('disable')
	}
	if (step < history.length - 1) {
		$('#redo').removeClass('disable')
	}
}
let redo = function() {
	let lastDraw = new Image()
	if (step < history.length - 1) step++
	lastDraw.src = history[step]
	lastDraw.onload = function() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight)
		ctx.drawImage(lastDraw, 0, 0)
	}
	if (step > 0) {
		$('#undo').removeClass('disable')
	}
	if (step == history.length - 1) {
		$('#redo').addClass('disable')
	}
}
let clearAll = function() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight)
	push()
}

let downHandler = function(e) {
	lastPointX = e.offsetX
	lastPointY = e.offsetY
	$('#draw').on('mousemove', moveHandler)
	$('#draw').on('mouseup', upHandler)
}
let moveHandler = function(e) {
	let newPointX = e.offsetX
	let newPointY = e.offsetY
	setPen()
	ctx.beginPath()
	ctx.moveTo(lastPointX, lastPointY)
	ctx.lineTo(newPointX, newPointY)
	ctx.stroke()
	lastPointX = newPointX
	lastPointY = newPointY
}
let upHandler = function() {
	$('#draw').off('mousemove', moveHandler)
	$('#draw').off('mouseup', upHandler)
	push()
}

let isDark = function(color) {
	let rgbArray = [color.substr(1, 2), color.substr(3, 2), color.substr(5, 2)]
	let brightness =
		parseInt(`0x${rgbArray[0]}`) * 0.213 +
		parseInt(`0x${rgbArray[1]}`) * 0.715 +
		parseInt(`0x${rgbArray[2]}`) * 0.072
	return brightness < 255 / 2
}
let setSize = function() {
	canvasWidth = $('body').outerWidth(true)
	canvasHeight = $('body').outerHeight(true)
	$('#draw').attr('width', canvasWidth)
	$('#draw').attr('height', canvasHeight)
}
let setColor = function() {
	colorBar.html('')
	brushColor.forEach(item => {
		let color = $(`<a class="color" href="javascript:;"></a>`)
		let check = $(`<p><i class="fas fa-check"></i></p>`)
		color.css('background', item)
		if (isDark(item)) check.css('color', 'white')
		color.append(check)
		colorBar.append(color)
	})
	$('.color')
		.eq(0)
		.addClass('active')
}
let setPen = function() {
	let colorIndex = $('.color.active').index()
	let lineSize = $('#size').val()
	ctx.lineWidth = lineSize
	ctx.lineCap = 'round'
	ctx.lineJoin = 'round'
	if (eraser) ctx.strokeStyle = backgroundColor
	else ctx.strokeStyle = brushColor[colorIndex]
}

let init = function() {
	setSize()
	setColor()
	$('#draw').css('background', backgroundColor)
	$('#draw').on('mousedown', downHandler)
	push()
}
init()
$(window).on('resize', init)

$('#clear').on('click', clearAll)
$('#undo').on('click', undo)
$('#redo').on('click', redo)
$('#save').on('click', function() {
	let link = canvas.toDataURL('image/png')
	$(this).attr('href', link)
	$(this).attr('download', 'canvas.png')
})

$('.tools a').on('click', function() {
	$(this)
		.addClass('active')
		.siblings()
		.removeClass('active')
	if ($(this).hasClass('eraser')) eraser = true
	else eraser = false
})

$('body').on('click', '.color', function() {
	$(this)
		.addClass('active')
		.siblings()
		.removeClass('active')
})
$('#colorPicker').on('change', function() {
	let newColor = $(this).val()
	brushColor.shift()
	brushColor.push(newColor)
	setColor()
})

$('.barBtn').on('click', function() {
	$(this)
		.find('i')
		.toggleClass('fa-angle-down')
		.toggleClass('fa-angle-up')
		.end()
		.parent()
		.toggleClass('hide')
})
