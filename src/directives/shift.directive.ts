// Angular Library Imports
import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({ selector: '[addShift]' })
export class AddShiftDirective implements AfterViewInit{
    constructor(private el: ElementRef, private renderer : Renderer2) {
    }

    /**
     * Add shift button
     */
    private addShiftButton(): void {
        // Get current element
        let currentElement = this.el.nativeElement;
        // Add shift container row
        const row = this.renderer.createElement('div');
        // Add CSS classes to row
        this.renderer.addClass(row, 'cal-events-row')
        this.renderer.addClass(row, 'ng-star-inserted');
        this.renderer.addClass(row, 'add-shift-row');
        // Prepare shift element
        let div;
        const width = 14.2857;
        // Get first child
        let firstChild = currentElement.firstElementChild;
        for(let i=0; i<=6; i++) {
            div = this.renderer.createElement('div');
            // Add classes to shift element
            this.renderer.addClass(div, 'cal-event-container');
            this.renderer.addClass(div, 'cal-starts-within-week');
            this.renderer.addClass(div, 'cal-ends-within-week');
            this.renderer.addClass(div, 'ng-star-inserted');
            this.renderer.addClass(div, 'add-shift-div');
            this.renderer.setStyle(div, 'margin-left', width*i + '%');
            // Formulate button
            div.innerHTML = '<button class="add-shift-button" onclick="window.angularComponentRef.component.addNewShift('+(i+1)+')">+</button>';
            this.renderer.appendChild(row, div);
            div = undefined;
        }
        // Add shift container row
        const salesEditRow = this.renderer.createElement('div');
        // Add CSS classes to row
        this.renderer.addClass(salesEditRow, 'cal-events-row');
        this.renderer.addClass(salesEditRow, 'ng-star-inserted');
        this.renderer.addClass(salesEditRow, 'sales-edit-row');
        // Formulate Labels
        salesEditRow.innerHTML = `<div class="left-label"><label class="sales-button-left">Sales</label><label class="edit-button-left">Edit</label></div>
                                  <div class="area-btn"><button class="hide-area-button">Hide Area</button></div>
                                  <div class="right-label"><label class="edit-button-right">Edit</label><label class="sales-button-right">Sales</label></div>`;
        // Inject Row
        this.renderer.appendChild(firstChild, salesEditRow);
        
        // Add new area container row
        const addNewAreaRow = this.renderer.createElement('div');
        // Add CSS classes to row
        this.renderer.addClass(addNewAreaRow, 'cal-events-row');
        this.renderer.addClass(addNewAreaRow, 'ng-star-inserted');
        this.renderer.addClass(addNewAreaRow, 'add-new-area-row');
        // Formulate Labels
        addNewAreaRow.innerHTML = `<div class="add-area"><label class="add-area-label">Add New Area</label></div>`;
        // Inject Row
        this.renderer.appendChild(firstChild, addNewAreaRow);
        this.renderer.appendChild(firstChild, row);

        
    }

    /**
     * Angular lifecycle event for view init
     */
    ngAfterViewInit(): void {
        this.addShiftButton();
    }
}