class Lift {
  constructor(id, status, floor) {
    this.id = id;
    this.status = status;
    this.floor = floor;
  }
}

// Variables
let numberOfLifts = 0;
let numberOfFloors = 0;
let startingFloorOfLift = 0;

// reference for buttons
const numberOfFloorButton = document.getElementById('number-of-floor-button');
const numberOfLiftsButton = document.getElementById('number-of-lifts-button');

// refrences for config sections
const numberOfFloorConfig = document.getElementById('number-of-floor-config');
const numberOfLiftsConfig = document.getElementById('number-of-lifts-config');
const loaderSection = document.getElementById('loader-section');

// building
const building = document.getElementById('building');

// number of lifts at a floor
const liftsOnFloor = new Map();
const pendingLiftRequest = [];

const getAvailableLift = (calledFloorNumber) => {
  for (const floor of liftsOnFloor.keys()) {
    for (const lift of liftsOnFloor.get(floor)) {
      if (lift.status === 'idle') return lift;
    }
  }
};

const handlePendingLiftRequests = () => {
  console.log(pendingLiftRequest);
  if (pendingLiftRequest.length === 0) return;

  const calledFloorNumber = pendingLiftRequest.shift();
  handleLiftCall(calledFloorNumber);
};

const handleLiftCall = (calledFloorNumber) => {
  // Check if lift is already in the floor from where its called
  if (
    liftsOnFloor.get(calledFloorNumber) &&
    liftsOnFloor.get(calledFloorNumber).length > 0
  )
    return;

  // get available lift
  const availableLift = getAvailableLift(calledFloorNumber);

  if (!availableLift) {
    pendingLiftRequest.push(calledFloorNumber);
    return;
  }

  const liftElement = document.getElementById(`lift-${availableLift.id}`);

  const translatePixel = -(calledFloorNumber - startingFloorOfLift) * 80;
  const transformMs = Math.abs(calledFloorNumber - availableLift.floor) * 2000;

  // Animate the lift to the floor
  liftElement.style.transition = `transform ${transformMs}ms ease-in-out`;
  availableLift.status = 'moving';
  liftElement.style.transform = `translateY(${translatePixel}px)`;

  const indexOfAvailableLift = liftsOnFloor
    .get(availableLift.floor)
    .indexOf(availableLift);

  // Update the lifts on floor
  liftsOnFloor.get(availableLift.floor).splice(indexOfAvailableLift, 1);
  liftsOnFloor.get(calledFloorNumber).push(availableLift);

  // Once the lift reaches the floor, update the status
  setTimeout(() => {
    availableLift.status = 'idle';
    availableLift.floor = calledFloorNumber;
    handlePendingLiftRequests();
  }, transformMs);
};

const getLiftsButton = (floorNumber) => {
  // Up Button
  const upButton = document.createElement('button');
  upButton.addEventListener('click', () => {
    handleLiftCall(floorNumber);
  });
  upButton.innerHTML = '<i class="fa-sharp fa-solid fa-angle-up"></i>';
  upButton.classList.add('up', 'text-blue-500', 'hover:text-blue-600');

  // Down Button
  const downButton = document.createElement('button');
  downButton.addEventListener('click', () => {
    handleLiftCall(floorNumber);
  });
  downButton.innerHTML = '<i class="fa-sharp fa-solid fa-angle-down"></i>';
  downButton.classList.add('down', 'text-blue-500', 'hover:text-blue-600');

  return { upButton, downButton };
};

const createFloor = (floor) => {
  const floorElement = document.createElement('div');
  floorElement.classList.add(
    'floor',
    'flex',
    'border-b-2',
    'border-b-zinc-500',
    'h-[80px]',
    'w-[90%]'
  );
  floorElement.id = `floor-${floor}`;

  // Floor Number section
  const floorNumberElement = document.createElement('p');
  floorNumberElement.innerHTML =
    floor === 0 ? 'Ground Floor' : `Floor - ${floor}`;

  // Generating buttons for floor
  const buttonsSection = document.createElement('div');
  buttonsSection.classList.add('flex', 'flex-col', 'items-start');
  const { upButton, downButton } = getLiftsButton(floor);

  if (floor === 0) {
    buttonsSection.appendChild(upButton);
    buttonsSection.appendChild(floorNumberElement);
  } else if (floor === numberOfFloors) {
    buttonsSection.appendChild(floorNumberElement);
    buttonsSection.appendChild(downButton);
  } else {
    buttonsSection.appendChild(upButton);
    buttonsSection.appendChild(floorNumberElement);
    buttonsSection.appendChild(downButton);
  }

  // Lifts section
  const liftsContainer = document.createElement('div');
  liftsContainer.classList.add('lifts', 'flex', 'justify-around', 'grow');

  // append buttons and lifts section to the floor
  floorElement.appendChild(buttonsSection);
  floorElement.appendChild(liftsContainer);
  liftsOnFloor.set(floor, []);
  return floorElement;
};

const createLift = (liftNumber) => {
  const lift = document.createElement('section');
  lift.id = `lift-${liftNumber}`;
  lift.classList.add(
    'lift',
    'border-2',
    'border-zinc-500',
    'h-[80px]',
    'w-[60px]',
    'bg-slate-100',
    'ml-4',
    'flex',
    'justify-between'
  );
  return lift;
};

const setupBuilding = () => {
  // seting up floors for the building

  for (let i = numberOfFloors; i >= 0; i -= 1) {
    const floor = createFloor(i);
    building.appendChild(floor);
  }
  ` `;
  // Setting up lifts
  startingFloorOfLift = Math.floor(Math.random() * numberOfFloors);
  const startinFloorElement = document
    .getElementById(`floor-${startingFloorOfLift}`)
    .querySelector('.lifts');
  for (let i = 1; i <= numberOfLifts; i += 1) {
    const lift = createLift(i);
    startinFloorElement.appendChild(lift);

    const liftInstance = new Lift(i, 'idle', startingFloorOfLift);
    liftsOnFloor.get(startingFloorOfLift).push(liftInstance);
  }
};

const storeNumberOfFloors = () => {
  numberOfFloors = +document.getElementById('floors').value;
  if (numberOfFloors > 8) {
    document.getElementById('floor-error').innerHTML =
      'Oops! right now I cannot build a building with floors greater than 8.';
    return;
  }
  document.getElementById('floor-error').innerHTML = '';
  numberOfFloorConfig.classList.add('hidden');
  numberOfLiftsConfig.classList.remove('hidden');
  numberOfLiftsConfig.animate(
    [
      {
        // from
        opacity: 0,
        color: '#fff',
      },
      {
        // to
        opacity: 1,
        color: '#000',
      },
    ],
    500
  );
};

const storeNumberOfLifts = () => {
  numberOfLifts = +document.getElementById('lifts').value;
  if (numberOfLifts > 5) {
    document.getElementById('lift-error').innerHTML =
      'Lets play with 5 lifts for now!';
    return;
  }
  document.getElementById('lift-error').innerHTML = '';
  numberOfLiftsConfig.classList.add('hidden');
  loaderSection.classList.remove('hidden');
  document.body.classList.add('bg-black');

  setupBuilding();

  // remove the loader section and show the building
  setTimeout(() => {
    document.body.classList.remove('bg-black');
    loaderSection.classList.add('hidden');
    building.classList.remove('hidden');
  }, 2000);
};

numberOfFloorButton.addEventListener('click', storeNumberOfFloors);
numberOfLiftsButton.addEventListener('click', storeNumberOfLifts);
