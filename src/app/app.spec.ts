import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app'; 
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

describe('AppComponent (Timeline)', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  // 1. ADDED MOCK: This intercepts localStorage calls so the test runner doesn't crash!
  beforeEach(() => {
    let store: { [key: string]: string } = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => key in store ? store[key] : null,
      setItem: (key: string, value: string) => { store[key] = `${value}`; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, NgbDatepickerModule] 
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

 describe('Timeline Math & Layout', () => {
    
    it('should calculate the correct bar width based on duration', () => {
      const mockOrder = {
        data: { startDate: '2025-10-01', endDate: '2025-10-05' }
      };

      // 1. Bulletproof Mock: Override the method directly on the component instance
      component.getPixelPositionFromDate = (dateStr: any): number => {
        if (dateStr === '2025-10-01') return 100; // Start at 100px
        if (dateStr === '2025-10-05') return 300; // End at 300px
        return 0;
      };

      // 2. The math should be 300 - 100 = 200px.
      expect(component.getBarWidth(mockOrder as any)).toEqual(200);
    });

    it('should enforce a minimum bar width of 40px for very short tasks', () => {
      const mockOrder = {
        data: { startDate: '2025-10-01', endDate: '2025-10-01' } 
      };

      // 1. Bulletproof Mock: Force it to always return 100px
      component.getPixelPositionFromDate = () => 100;

      // 2. 100 - 100 = 0. Math.max(0, 40) should fall back to your 40px minimum!
      expect(component.getBarWidth(mockOrder as any)).toEqual(40);
    });

  });

  describe('Performance Optimizations', () => {
    it('should track work orders by their unique docId', () => {
      const mockOrder = { docId: 'wo-999', data: { name: 'Test' } };
      
      // Call the tracking function we added earlier
      const trackedValue = component.trackByWorkOrder(0, mockOrder);
      
      // It should extract and return the exact ID
      expect(trackedValue).toEqual('wo-999');
    });

    it('should track date columns by their ISO string', () => {
      const mockDate = new Date('2026-05-01T00:00:00Z');
      const trackedValue = component.trackByDate(0, mockDate);
      
      expect(trackedValue).toEqual(mockDate.toISOString());
    });
  });

  describe('UI & Formatting', () => {
    it('should return the correct CSS class for a given status', () => {
      // Test the happy paths
      expect(component.getStatusClass('complete')).toEqual('status-complete');
      expect(component.getStatusClass('in-progress')).toEqual('status-in-progress');
      expect(component.getStatusClass('blocked')).toEqual('status-blocked');
      
      // Test the default/fallback path (e.g., 'open' or an unknown status)
      expect(component.getStatusClass('open')).toEqual('status-open');
    });
  });

  describe('State Management', () => {
    it('should close panels and menus when a work order is deleted', () => {
      // 1. Arrange: Pretend the user has a menu and the edit panel open
      const dummyOrders = [{ docId: 'order-1', data: { name: 'Delete Me' } }];
      component.workOrders.set(dummyOrders as any);
      
      component.isPanelOpen.set(true);
      component.activeMenuId.set('menu-1');
      component.editingDocId.set('order-1');

      // 2. Act: Delete the order
      component.deleteWorkOrder('order-1');

      // 3. Assert: Everything should be forcefully closed off
      expect(component.isPanelOpen()).toBe(false);
      expect(component.activeMenuId()).toBeNull();
      expect(component.editingDocId()).toBeNull();
    });
  });

  describe('Work Order Interactions', () => {
    it('should remove a work order and clear the hovered tooltip state when deleted', () => {
      // 1. Arrange: Set up initial state with one dummy order
      const dummyOrders = [{ docId: 'order-1', data: { name: 'Delete Me' } }];
      component.workOrders.set(dummyOrders as any);
      
      // Simulate that the user was hovering over it
      component.hoveredTask.set(dummyOrders[0] as any);
      
      // 2. Act: Call the delete method
      component.deleteWorkOrder('order-1');
      
      // 3. Assert: Check the signals updated correctly
      expect(component.workOrders().length).toBe(0); // The array should be empty
      expect(component.hoveredTask()).toBeNull();    // The ghost tooltip must be killed!
    });
  });

  describe('Infinite Scroll Dynamics', () => {
    it('should prepend past dates when scrolling near the left edge', () => {
      // 1. Arrange: Create a fake scroll event where scrollLeft is under the 350px threshold
      const mockEvent = {
        target: { scrollLeft: 100, scrollWidth: 2000, clientWidth: 1000 }
      } as unknown as Event;

      const initialOffset = component.leftOffsetIndex();

      // 2. Act: Trigger the scroll handler
      component.handleScroll(mockEvent);

      // 3. Assert: It should shift the left offset by 12 days to load past dates
      expect(component.leftOffsetIndex()).toEqual(initialOffset - 12);
      expect(component.isAdjustingScroll).toBe(true);
    });

    it('should append future dates when scrolling near the right edge', () => {
      // 1. Arrange: Create a fake scroll event near the right edge
      // scrollWidth (2000) - scrollLeft (1000) - clientWidth (800) = 200px remaining (< 350px threshold)
      const mockEvent = {
        target: { scrollLeft: 1000, scrollWidth: 2000, clientWidth: 800 }
      } as unknown as Event;

      const initialOffset = component.rightOffsetIndex();

      // 2. Act
      component.handleScroll(mockEvent);

      // 3. Assert: It should shift the right offset by 12 days
      expect(component.rightOffsetIndex()).toEqual(initialOffset + 12);
    });
  });

  describe('Menu Toggling', () => {
    it('should open a context menu, and close it if clicked again', () => {
      // 1. Arrange: Ensure no menus are open
      component.activeMenuId.set(null);
      
      // Create a fake mouse click event (we add stopPropagation so your actual code doesn't error out)
      const mockEvent = { stopPropagation: () => {} } as unknown as Event;
      
      // 2. Act: Click the three-dot menu, passing BOTH the fake event and the ID
      component.toggleMenu(mockEvent, 'wo-1');
      
      // 3. Assert: The menu should be open
      expect(component.activeMenuId()).toBe('wo-1');
      
      // 4. Act: Click the exact same menu again
      component.toggleMenu(mockEvent, 'wo-1');
      
      // 5. Assert: It should recognize it was already open and close it
      expect(component.activeMenuId()).toBeNull();
    });
  });

});