import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  templateUrl: './loading-screen.html',
  imports: [CommonModule],
  styleUrls: ['./loading-screen.css']
})
export class LoadingScreenComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Loading';
  @Input() message: string = 'Please wait...';
}
